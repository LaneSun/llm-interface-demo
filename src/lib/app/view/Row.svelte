<script lang="ts">
    let {
        row,
        "row-end": row_end,
        items = [],
    }: { row: number; "row-end": boolean; items?: any[] } = $props();
</script>

{#each items as [Component, params], i}
    <Component
        {...params}
        {row}
        row-end={row_end}
        col-end={i === items.length - 1}
    />
{/each}
