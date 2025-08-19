<script>
    import { env } from "$env/dynamic/public";
    import { Button } from "$lib/components/ui/button";
    import Input from "$lib/components/ui/input/input.svelte";
    import Separator from "$lib/components/ui/separator/separator.svelte";
    import LLM from "@themaximalist/llm.js";
    import { onMount } from "svelte";
    import { marked } from "marked";
    import { Contexts } from "./context";
    import { parse } from "@thi.ng/sexpr";

    const opts = {
        service: "openrouter",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: env.PUBLIC_OPENROUTER_API_KEY,
        model: "openai/gpt-oss-120b",
        // model: "google/gemma-3-27b-it",
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
        const json = context.to_json();
        console.log(JSON.stringify(json));
        llm.messages[0].content = `\
You are an AI assistant for ${context.app_name}. Here is the current app context:
\`\`\`json
${JSON.stringify(json)}
\`\`\`

Please respond according to the following guidelines:
1. Always reply in **Simplified Chinese (zh_CN)**
2. Prioritize answers based on the provided context
3. If the context is insufficient, politely ask the user for clarification
4. Maintain a friendly and professional tone

Response may include embedded view in Scheme LISP markup. Refer to the \`available_views\` in \
the context for supported view functions and arguments. Each view code should be put inside \
a (view ...) call with in a \`\`\`lisp ... \`\`\` code block, app will parse and render the real \
view below the assistant content.
`;
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
            console.log(view_content);
            const expr = parse(view_content, {
                scopes: [
                    ["(", ")"],
                    ["[", "]"],
                ],
            });
            console.log(expr);
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
