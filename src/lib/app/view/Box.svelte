<script lang="ts">
    let { grow = false, items = [] }: { grow?: boolean; items?: any[] } =
        $props();
</script>

<div class={["-m-2 p-2", grow ? "box-fill" : "box"]}>
    {#each items as [Component, params]}
        <Component {...params} />
    {/each}
</div>
