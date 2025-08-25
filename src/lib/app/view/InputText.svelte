<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { to_writable } from "$lib/utils";

    let {
        label = "",
        value = "",
    }: {
        label?: string;
        value?: string;
    } = $props();

    let rvalue = to_writable(value);
</script>

<div class="box-fill gap-1.5">
    {#if label}
        <Label>{label}</Label>
    {/if}

    <Input type="text" bind:value={$rvalue} placeholder="请输入文本" />
</div>
