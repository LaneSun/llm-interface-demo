<script lang="ts">
    import { Label } from "$lib/components/ui/label";
    import { to_readables } from "$lib/utils";

    let { items = [] }: { items?: any[] } = $props();

    let ritems = to_readables(items);
</script>

<Label class="whitespace-nowrap">
    {#each $ritems as item}
        <span>{item}</span>
    {/each}
</Label>
