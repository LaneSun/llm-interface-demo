<script module>
    export const name = "实时视图";
    export const xxxx = "HHHH";
</script>

<script>
    import { Collectors } from "$lib/app/collector";
    import { frame } from "$lib/utils";
    import { onMount, tick } from "svelte";

    export const xxxx = "HHHH";

    const colors = [
        "#f43f5e",
        "#d946ef",
        "#3b82f6",
        "#06b6d4",
        "#14b8a6",
        "#22c55e",
        "#eab308",
    ];

    let { collector, color = colors[0 | (Math.random() * colors.length)] } =
        $props();

    let signal_data = $state([]);
    /** @type {CanvasRenderingContext2D} */
    let context = $state();

    let prev_collector;
    $effect(() => {
        if (collector !== prev_collector) {
            prev_collector?.off("data", add_data);
            prev_collector = collector;
            collector?.on("data", add_data);
        }
    });

    function add_data(data) {
        if (signal_data.length >= 1000) {
            signal_data.shift();
        }
        signal_data.push(data);
    }
</script>

<div class="box-fill">
    <canvas
        class="w-full h-full"
        style:image-rendering="smooth"
        {@attach async (cav) => {
            await tick();
            const scale = 1;
            cav.width = cav.clientWidth * scale;
            cav.height = cav.clientHeight * scale;
            context = cav.getContext("2d");
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
            const gradient = context.createLinearGradient(0, 0, 0, cav.height);
            gradient.addColorStop(0, color + "66");
            gradient.addColorStop(1, color + "00");
            cav.gradient = gradient;
            context.lineWidth = scale;
        }}
        {@attach async (cav) => {
            if (context) {
                context.clearRect(0, 0, cav.width, cav.height);
                context.beginPath();
                const ypos = (data) => cav.height * (1 - data);
                context.moveTo(-2, cav.height + 2);
                context.lineTo(-2, ypos(signal_data[0]));
                context.lineTo(0, ypos(signal_data[0]));
                for (let i = 1; i < signal_data.length; i++) {
                    context.lineTo(
                        cav.width * (i / signal_data.length),
                        ypos(signal_data[i]),
                    );
                }
                context.lineTo(
                    cav.width + 2,
                    ypos(signal_data[signal_data.length - 1]),
                );
                context.lineTo(cav.width + 2, cav.height + 2);
                context.closePath();
                context.globalAlpha = 1;
                context.fillStyle = cav.gradient;
                context.strokeStyle = color;
                context.fill();
                context.stroke();
                const cur_data = signal_data.at(-1);
                const prev_data = cav.prev_data ?? cur_data;
                cav.prev_data = cur_data;
                context.fillStyle = color;
                context.globalAlpha =
                    1 / Math.sqrt(Math.abs(cur_data - prev_data) * cav.height);
                context.fillRect(
                    0,
                    ypos(Math.max(cur_data, prev_data)) - 1,
                    cav.width,
                    cav.height * Math.abs(cur_data - prev_data) + 2,
                );
            }
        }}
    ></canvas>
</div>
