<script lang="ts">
    import Label from "$lib/components/ui/label/label.svelte";
    import { Switch } from "$lib/components/ui/switch";
    import { to_writable } from "$lib/utils";

    let {
        label = "",
        value = false,
    }: {
        label?: string;
        value?: boolean;
    } = $props();

    let rvalue = to_writable(value);
</script>

<div class="flex-fill gap-2 items-center">
    {#if label}
        <Label class="flex-1 whitespace-nowrap">{label}</Label>
    {/if}

    <Switch bind:checked={$rvalue} />
</div>
