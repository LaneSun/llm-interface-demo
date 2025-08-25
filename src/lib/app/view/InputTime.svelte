<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { to_writable } from "$lib/utils";

    let {
        label = "",
        value = "",
        time = true,
        date = true,
    }: {
        label?: string;
        value?: string;
        time?: boolean;
        date?: boolean;
    } = $props();

    let rvalue = to_writable(value);

    function getInputType(): string {
        if (date && time) return "datetime-local";
        if (date) return "date";
        if (time) return "time";
        return "datetime-local";
    }

    function getPlaceholder(): string {
        if (date && time) return "选择日期和时间";
        if (date) return "选择日期";
        if (time) return "选择时间";
        return "选择日期和时间";
    }
</script>

<div class="box-fill gap-1.5">
    {#if label}
        <Label>{label}</Label>
    {/if}

    <Input
        type={getInputType()}
        bind:value={$rvalue}
        placeholder={getPlaceholder()}
    />
</div>
