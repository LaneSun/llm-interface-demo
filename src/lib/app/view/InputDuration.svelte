<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { parse_duration, to_writable } from "$lib/utils";
    import { get } from "svelte/store";

    let {
        label = "",
        value = "00:00:00",
        max = "23:59:59",
        min = "00:00:00",
    }: {
        label?: string;
        value?: string;
        max?: string;
        min?: string;
    } = $props();

    let rvalue = to_writable(value);

    function reset_time(value: string) {
        rvalue.set(min);
        rvalue.set(max);
        rvalue.set(value);
    }

    function validateAndSetValue(input: string) {
        try {
            const time = parse_duration(input);
            const min_time = parse_duration(min);
            const max_time = parse_duration(max);
            if (time < min_time) {
                reset_time(min);
            } else if (time > max_time) {
                reset_time(max);
            } else {
                rvalue.set(input);
            }
        } catch {
            reset_time(get(rvalue));
        }
    }

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        validateAndSetValue(target.value);
    }
</script>

<div class="box-fill gap-1.5">
    {#if label}
        <Label class="whitespace-nowrap">{label}</Label>
    {/if}

    <Input
        type="time"
        step={1}
        value={$rvalue}
        oninput={handleInput}
        placeholder="选择时长"
    />
</div>
