<script lang="ts">
    let {
        row,
        "row-end": row_end,
        "col-end": col_end,
        items = [],
    }: {
        row: number;
        "row-end": boolean;
        "col-end": boolean;
        items?: any[];
    } = $props();
</script>

<div
    class={["f-cell box p-2", row_end && "f-row-end", col_end && "f-col-end"]}
    style="grid-row: {row};"
>
    {#each items as [Component, params]}
        <Component {...params} />
    {/each}
</div>
