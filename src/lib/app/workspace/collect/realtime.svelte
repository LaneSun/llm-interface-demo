<script module>
    export const name = "实时";
</script>

<script>
    import { Collectors } from "$lib/app/collector";
    import { Views } from "$lib/app/view";
    import * as Resizable from "$lib/components/ui/resizable";
    import { Separator } from "$lib/components/ui/separator";
    import { frame } from "$lib/utils";
    import { onMount, tick } from "svelte";

    let collectors = [
        new Collectors.RandomRMD(),
        new Collectors.RandomWave(),
        new Collectors.SineWave(),
        new Collectors.SquareWave(),
        new Collectors.TriangleWave(),
        new Collectors.SawWave(),
    ];

    onMount(() => {
        collectors.forEach((c) => c.start());
        return () => collectors.forEach((c) => c.stop());
    });
</script>

<Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane defaultSize={20}>
        <div class="p-2">信号列表</div>
        <Separator />
        <div class="box-fill">
            {#each collectors as collector}
                <div class="p-1 text-sm">{collector.constructor.name}</div>
                <Separator />
            {/each}
        </div>
    </Resizable.Pane>
    <Resizable.Handle />
    <Resizable.Pane class="box">
        <div class="p-2">信号数据</div>
        {#each collectors as collector}
            <Separator />
            <Views.Realtime {collector} />
        {/each}
    </Resizable.Pane>
</Resizable.PaneGroup>
