<script lang="ts">
    let { grow = false, items = [] }: { grow?: boolean; items?: any[] } =
        $props();
</script>

<div class={["-m-2 f-hbox p-2 gap-2", grow ? "flex-fill" : "flex"]}>
    {#each items as [Component, params]}
        <Component {...params} />
    {/each}
</div>
