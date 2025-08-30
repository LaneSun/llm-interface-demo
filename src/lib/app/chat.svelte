<script>
    import { env } from "$env/dynamic/public";
    import { Button } from "$lib/components/ui/button";
    import Input from "$lib/components/ui/input/input.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import RotateCw from "@lucide/svelte/icons/rotate-cw";
    import SendHorizontal from "@lucide/svelte/icons/send-horizontal";
    import LLM from "@themaximalist/llm.js";
    import { onMount } from "svelte";
    import { marked } from "marked";
    import { Contexts, SYSTEM_PROMPT } from "./context";
    import { parse } from "@thi.ng/sexpr";
    import { Views } from "./view";
    import * as stores from "svelte/store";
    import Textarea from "$lib/components/ui/textarea/textarea.svelte";

    const opts = {
        service: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: env.PUBLIC_OPENROUTER_API_KEY,
        // model: "openai/gpt-oss-120b",
        // model: "google/gemma-3-27b-it",
        // model: "inception/mercury",
        model: "deepseek/deepseek-chat-v3.1",
        // service: "deepseek",
        // apiKey: env.PUBLIC_DEEPSEEK_API_KEY,
        // model: "deepseek-chat",
        max_tokens: 65535,
        stream: true,
    };

    const context = {};

    let llm = $state();
    let start_time = new Date().toLocaleString();
    let last_user_reaction_time = new Date().toLocaleString();
    let last_llm_reaction_time = new Date().toLocaleString();

    onMount(() => {
        llm = new LLM(opts);
        llm.system("");
    });

    let input = $state("");
    let history = $state([]);

    function update_sys() {
        const context = new Contexts.Root().with({
            current_conversation: new Contexts.Conversation().with({
                start_time,
                last_user_reaction_time,
                last_llm_reaction_time,
            }),
        });
        llm.messages[0].content = SYSTEM_PROMPT(context);
    }

    async function chat(msg) {
        last_user_reaction_time = new Date().toLocaleString();
        history.push({ role: "user", content: msg });
        input = "";
        try {
            update_sys();
            let response = "";
            last_llm_reaction_time = new Date().toLocaleString();
            history.push({ role: "assistant", content: "*Pending*" });
            const idx = history.length - 1;
            for await (const res of await llm.chat(msg)) {
                if (res instanceof Error) {
                    throw res;
                }
                response += res;
                history[idx] = {
                    role: "assistant",
                    content: response,
                };
            }
            console.log(response);
            try {
                const env = await parse_prepare(idx);
                const views = parse_view(idx, env);
                console.log(views);
                // response = response.replaceAll(/```(?:js|lisp).*?```/gs, "");
                history[idx] = {
                    ...history[idx],
                    content: response,
                    views,
                };
            } catch (e) {
                console.error(e);
                const err_msg = e.toString();
                history[idx] = {
                    ...history[idx],
                    error: err_msg,
                };
            }
        } catch (e) {
            console.error(e);
            history.pop();
            alert(e.toString());
        }
    }

    async function retry(idx) {
        await chat(
            `你编写的代码有误，请修正并重新回答，报错为：${history[idx].error}`,
        );
        if (!history.at(-1).error) {
            for (let i = 0; i < history.length; i++) {
                if (history[i].error) {
                    history.splice(i, 2);
                }
            }
        }
    }

    async function parse_prepare(idx) {
        const { content } = history[idx];
        const prepare_content = content.match(/```js(.*?)```/s)?.[1];
        if (prepare_content) {
            const env = await prepare(prepare_content);
            return env;
        }
        return {};
    }

    function parse_view(idx, env = {}) {
        const { content } = history[idx];
        const view_content = content.match(/```lisp(.*?)```/s)?.[1];
        if (view_content) {
            const expr = parse(view_content, {
                scopes: [
                    ["(", ")"],
                    ["[", "]"],
                ],
            });
            const tenv = Object.fromEntries(
                Object.entries(env).map(([k, v]) => [k.toLowerCase(), v]),
            );
            const asts = expr.children.map(parse_sexpr);
            const views = asts.map((ast) => compile(ast, tenv));
            return views;
        }
        return undefined;
    }

    function parse_sexpr(expr) {
        switch (expr.type) {
            // case "root": return expr.children.map(parse_sexpr);
            case "expr": {
                switch (expr.value) {
                    case "(":
                        return expr.children.map(parse_sexpr);
                    case "[":
                        return ["array"].concat(expr.children.map(parse_sexpr));
                    default:
                        throw new Error(
                            `Unsupported expression type: ${expr.type}`,
                        );
                }
            }
            case "sym": {
                const sym = expr.value.toLowerCase();
                switch (sym) {
                    case "false":
                        return ["boolean", false];
                    case "true":
                        return ["boolean", true];
                    case "null":
                        return ["null", null];
                    case "undefined":
                        return ["undefined"];
                    default:
                        return expr.value.toLowerCase();
                }
            }
            case "num":
                return ["number", expr.value];
            case "str":
                return ["string", expr.value];
            default:
                throw new Error(`Unsupported expression type: ${expr.type}`);
        }
    }

    const Syms = ["array", ...Object.keys(Views)];

    function sym_fix(sym) {
        if (Syms.includes(sym)) return sym;
        else throw `symbol ${sym} not found in ${Syms.join(", ")}`;
    }

    async function prepare(src) {
        const store_list = Object.entries(stores);
        const root = new Function(
            store_list.map((e) => e[0]),
            src + "\n;return prepare;",
        );
        const handle = root(...store_list.map((e) => e[1]));
        return await handle({ ...context, ...stores });
    }

    function compile(ast, env = {}) {
        function parse_params(args) {
            function to_name(arg) {
                return typeof arg === "string" &&
                    (arg.startsWith(":") || arg.endsWith(":"))
                    ? (arg.split(":").filter((s) => s.trim().length > 0)[0] ??
                          null)
                    : null;
            }
            const items = [];
            const result = { items };
            for (let i = 0; i < args.length; i++) {
                const arg = args[i];
                if (arg instanceof Array) {
                    items.push(compile(arg, env));
                } else if (typeof arg === "string") {
                    const name = to_name(arg);
                    if (name) {
                        const val = args[i + 1];
                        if (val instanceof Array) {
                            result[name] = compile(val);
                        } else if (typeof val === "string") {
                            if (to_name(val)) {
                                throw `named param ${name} should have a value`;
                            } else if (val in env) {
                                result[name] = env[val];
                            } else {
                                throw `variable named ${val} not found`;
                            }
                        } else if (val === undefined) {
                            throw `named param ${name} should have a value`;
                        } else {
                            throw "unknow error";
                        }
                        i++;
                    } else if (arg in env) {
                        items.push(env[arg]);
                    } else {
                        throw `variable named ${arg} not found`;
                    }
                } else {
                    throw "unknown error";
                }
            }
            return result;
        }
        switch (ast[0]) {
            case "string":
            case "number":
            case "boolean":
            case "undefined":
            case "null":
                return ast[1];
            default: {
                const sym = sym_fix(ast[0]);
                if (sym in Views) {
                    const view = Views[sym];
                    const params = parse_params(ast.slice(1));
                    return [view, params];
                } else {
                    // TODO
                    throw `view named ${sym} not found`;
                }
            }
        }
    }
</script>

<div class="box-fill">
    <div class="box-scroll p-4">
        <div class="box gap-2 pb-[50vh]">
            {#each history as { role, content, views, error }, idx}
                <div class="box gap-1">
                    <div
                        class="box items-start gap-1 mx-auto min-w-0 w-160 max-w-full"
                    >
                        <div class="text-sm flex gap-1 items-center">
                            <div class="text-muted-foreground">{role}</div>
                            <Button
                                class="text-xs px-1! h-5"
                                variant="secondary"
                                onclick={() =>
                                    navigator.clipboard.writeText(content)}
                            >
                                复制
                            </Button>
                        </div>
                        <div
                            class="f-md self-stretch text-secondary-foreground bg-secondary rounded px-2 py-1 select-text"
                        >
                            {@html marked(content)}
                        </div>
                        {#if error}
                            <button
                                class="flex items-center rounded px-2 py-1 gap-1 text-destructive bg-destructive/20"
                                onclick={() => retry(idx)}
                            >
                                <RotateCw class="flex-none size-4" />
                                错误： {error}
                            </button>
                        {/if}
                    </div>
                    {#if views}
                        {#each views as [View, param]}
                            <div
                                class="self-center box p-2 rounded border border-border bg-background"
                            >
                                <View {...param} />
                            </div>
                        {/each}
                    {/if}
                </div>
            {/each}
        </div>
    </div>
    <Separator />
    <div class="flex p-2 gap-2">
        <form class="contents" onsubmit={() => chat(input)}>
            <Textarea bind:value={input} />
            <Button type="submit"><SendHorizontal /></Button>
        </form>
    </div>
</div>

<style>
    @reference "$lib/../app.css";

    :global(.f-md h1) {
        @apply text-2xl font-bold my-6;
    }

    :global(.f-md h2) {
        @apply text-xl font-bold my-5;
    }

    :global(.f-md h3) {
        @apply text-lg font-bold my-4;
    }

    :global(.f-md h4) {
        @apply text-base font-bold my-3;
    }

    :global(.f-md p) {
        @apply text-base my-2;
    }

    :global(.f-md pre > code) {
        --c-bg: color-mix(in lch, var(--background) 50%, var(--secondary));
        @apply relative p-2 max-h-32 block overflow-hidden border border-border rounded text-muted-foreground my-2 min-w-0 select-all;
        background: var(--c-bg);
    }

    :global(.f-md pre > code::after) {
        @apply pointer-events-none absolute inset-0;
        content: " ";
        background: linear-gradient(to bottom, transparent 50%, var(--c-bg));
    }
</style>
