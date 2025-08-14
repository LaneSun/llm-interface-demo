<script module>
    export const name = "实时";
</script>

<script>
    import { Collectors } from "$lib/app/collector";
    import * as Resizable from "$lib/components/ui/resizable";
    import { Separator } from "$lib/components/ui/separator";
    import { frame } from "$lib/utils";
    import { onMount, tick } from "svelte";

    let signal_data = $state([]);
    let context = $state();

    onMount(() => {
        const collector = new Collectors.RandomRMD();
        collector.on("data", add_data);
        collector.start();
        return () => collector.stop();
    });

    function add_data(data) {
        if (signal_data.length >= 1000) {
            signal_data.shift();
        }
        signal_data.push(data);
    }
</script>

<Resizable.PaneGroup direction="horizontal">
    <Resizable.Pane defaultSize={20}>
        <div class="p-2">信号列表</div>
        <Separator />
        <div class="box-fill"></div>
    </Resizable.Pane>
    <Resizable.Handle />
    <Resizable.Pane class="box">
        <div class="p-2">信号数据</div>
        <Separator />
        <div class="box-fill">
            <canvas
                class="w-full h-full"
                style:image-rendering="smooth"
                {@attach async (cav) => {
                    await tick();
                    cav.width = cav.clientWidth * 1;
                    cav.height = cav.clientHeight * 1;
                    context = cav.getContext("2d");
                    context.imageSmoothingEnabled = true;
                    context.imageSmoothingQuality = "high";
                    context.strokeStyle = "#0088ff";
                    const gradient = context.createLinearGradient(
                        0,
                        0,
                        0,
                        cav.height,
                    );
                    gradient.addColorStop(0, "#0088ff66");
                    gradient.addColorStop(1, "#0088ff00");
                    context.fillStyle = gradient;
                    context.lineWidth = 1;
                }}
                {@attach async (cav) => {
                    if (context) {
                        context.clearRect(0, 0, cav.width, cav.height);
                        context.beginPath();
                        context.moveTo(-2, cav.height + 2);
                        context.lineTo(-2, cav.height * signal_data[0]);
                        context.lineTo(0, cav.height * signal_data[0]);
                        for (let i = 1; i < signal_data.length; i++) {
                            context.lineTo(
                                cav.width * (i / signal_data.length),
                                cav.height * signal_data[i],
                            );
                        }
                        context.lineTo(
                            cav.width + 2,
                            cav.height * signal_data[signal_data.length - 1],
                        );
                        context.lineTo(cav.width + 2, cav.height + 2);
                        context.closePath();
                        context.fill();
                        context.stroke();
                    }
                }}
            ></canvas>
        </div>
    </Resizable.Pane>
</Resizable.PaneGroup>
