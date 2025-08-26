<script lang="ts">
    let { items = [] }: { items?: any[] } = $props();
</script>

<div class="separator"></div>

<style>
    .separator {
        flex-shrink: 0;
        background-color: var(--color-border);
    }

    /* In h-box context */
    :global(.f-hbox) > .separator {
        width: 1px;
        align-self: stretch;
        margin: -0.5rem 0;
    }

    /* In v-box context */
    :global(.f-vbox) > .separator {
        height: 1px;
        margin: 0 -0.5rem;
    }
</style>
