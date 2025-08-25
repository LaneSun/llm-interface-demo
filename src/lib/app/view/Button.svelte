<script lang="ts">
    import Button from "$lib/components/ui/button/button.svelte";

    let {
        text = "",
        click,
    }: {
        text?: string;
        click?: () => void;
    } = $props();

    function handleClick() {
        if (click) {
            click();
        } else {
            console.log("Button clicked:", text);
        }
    }
</script>

<Button onclick={handleClick}>{text}</Button>
