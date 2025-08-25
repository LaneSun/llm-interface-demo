<script lang="ts">
    import Label from "$lib/components/ui/label/label.svelte";
    import * as Select from "$lib/components/ui/select";
    import { to_writable } from "$lib/utils";

    let {
        items = [],
        label = "",
        multiple = false,
        value = multiple ? [] : undefined,
    }: {
        items?: any[];
        label?: string;
        multiple?: boolean;
        value?: any;
    } = $props();

    let rvalue = to_writable(value);

    function getDisplayText(): string {
        if (multiple) {
            return $rvalue.length > 0
                ? `已选择 ${$rvalue.length} 项`
                : "请选择";
        } else return $rvalue !== undefined ? String($rvalue) : "请选择";
    }
</script>

<div class="box-fill gap-1.5">
    {#if label}
        <Label>{label}</Label>
    {/if}

    <Select.Root type={multiple ? "multiple" : "single"} bind:value={$rvalue}>
        <Select.Trigger>
            {getDisplayText()}
        </Select.Trigger>
        <Select.Content>
            {#each items as [Component, params]}
                <Component {...params} />
            {/each}
        </Select.Content>
    </Select.Root>
</div>
