<script lang="ts">
    import * as Select from "$lib/components/ui/select";

    let {
        name = "",
        value = null,
    }: {
        name?: string;
        value?: any;
    } = $props();
</script>

<Select.Item {value} label={name}>{name}</Select.Item>
