<script lang="ts">
    type LineType = "none" | "row" | "column" | "all";

    let {
        items = [],
        line = "none",
    }: {
        items?: any[];
        line?: LineType;
    } = $props();
</script>

<div
    class={[
        "-m-2 grid-fill f-grid",
        {
            "show-row-lines": line === "row" || line === "all",
            "show-column-lines": line === "column" || line === "all",
        },
    ]}
    style="grid-template-rows: repeat({items.length}, auto);"
>
    {#each items as [Component, params], i}
        <Component {...params} row={i + 1} row-end={i === items.length - 1} />
    {/each}
</div>

<style>
    .f-grid.show-row-lines :global(.f-cell:not(.f-row-end)) {
        border-bottom: var(--color-border) 1px solid;
    }

    .f-grid.show-column-lines :global(.f-cell:not(.f-col-end)) {
        border-right: var(--color-border) 1px solid;
    }
</style>
