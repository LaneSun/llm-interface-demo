<script lang="ts">
    let { items = [] }: { items?: any[] } = $props();
</script>

{#each items as [Component, params]}
    <Component {...params} />
{/each}
