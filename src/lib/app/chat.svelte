<script>
    import { env } from "$env/dynamic/public";
    import { Button } from "$lib/components/ui/button";
    import Input from "$lib/components/ui/input/input.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import LLM from "@themaximalist/llm.js";
    import { onMount } from "svelte";
    import { marked } from "marked";
    import { Contexts, SYSTEM_PROMPT } from "./context";
    import { parse } from "@thi.ng/sexpr";

    const opts = {
        service: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: env.PUBLIC_OPENROUTER_API_KEY,
        model: "openai/gpt-oss-120b",
        // model: "google/gemma-3-27b-it",
        // model: "inception/mercury",
        // model: "deepseek/deepseek-chat-v3.1",
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
            for await (const res of await llm.chat(msg)) {
                if (res instanceof Error) {
                    throw res;
                }
                response += res;
                history[history.length - 1] = {
                    role: "assistant",
                    content: response,
                };
            }
            parse_view(history.length - 1);
        } catch (e) {
            console.error(e);
            history.pop();
            history.push({ role: "assistant", content: e.toString() });
        }
    }

    function parse_view(idx) {
        const { content } = history[idx];
        console.log(content);
        const view_content = content.match(/```lisp(.*?)```/s)?.[1];
        if (view_content) {
            const expr = parse(view_content, {
                scopes: [
                    ["(", ")"],
                    ["[", "]"],
                ],
            });
            const views = expr.children.map(parse_sexpr);
            console.log(views);
        }
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
            case "sym":
                return expr.value.toLowerCase();
            case "num":
                return ["number", expr.value];
            case "str":
                return ["string", expr.value];
            default:
                throw new Error(`Unsupported expression type: ${expr.type}`);
        }
    }
</script>

<div class="box-fill">
    <div class="box-scroll p-4">
        <div class="box gap-2">
            {#each history as { role, content }}
                <div class="box gap-1 items-start">
                    <div class="text-muted-foreground text-sm">{role}</div>
                    <div
                        class="text-secondary-foreground bg-secondary rounded px-2 py-1 select-text"
                    >
                        {@html marked(content)}
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <Separator />
    <div class="flex p-2 gap-2">
        <form class="contents" onsubmit={() => chat(input)}>
            <Input bind:value={input} />
            <Button type="submit">发送</Button>
        </form>
    </div>
</div>
