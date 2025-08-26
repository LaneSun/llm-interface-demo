<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { to_writable } from "$lib/utils";

    let {
        label = "",
        max,
        min,
        value = 0,
    }: {
        label?: string;
        max?: number;
        min?: number;
        value?: number;
    } = $props();

    let rvalue = to_writable(value);
</script>

<div class="box-fill gap-1.5">
    {#if label}
        <Label class="whitespace-nowrap">{label}</Label>
    {/if}

    <Input
        type="number"
        bind:value={$rvalue}
        {min}
        {max}
        placeholder="请输入数字"
    />
</div>
