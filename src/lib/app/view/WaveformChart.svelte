<script>
    import Label from "$lib/components/ui/label/label.svelte";
    import { CircularBuffer, create_renderer, to_readable } from "$lib/utils";
    import { onMount, tick } from "svelte";
    import { readable } from "svelte/store";

    const colors = [
        "#f43f5e",
        "#d946ef",
        "#3b82f6",
        "#06b6d4",
        "#14b8a6",
        "#22c55e",
        "#eab308",
    ];

    let {
        label = "",
        emitter = readable(0),
        duration = 1000,
        color: p_color = colors[0 | (Math.random() * colors.length)],
    } = $props();

    let s_color = to_readable(p_color);
    let color = $derived($s_color);

    let signal_data = new CircularBuffer(duration);
    let data_min = $state(0);
    let data_max = $state(1);

    /** @type {CanvasRenderingContext2D} */
    let context = $state();

    onMount(() => {
        const unsubscribe = emitter.subscribe((value) => {
            add_data(value);
        });
        return () => {
            unsubscribe();
        };
    });

    $effect(() => {
        if (duration) {
            signal_data = new CircularBuffer(duration);
        }
    });

    $effect(() => {
        if (context && color) {
            const cav = context.canvas;
            const gradient = context.createLinearGradient(0, 0, 0, cav.height);
            gradient.addColorStop(0, color + "66");
            gradient.addColorStop(1, color + "00");
            cav.gradient = gradient;
        }
    });

    function add_data(data) {
        signal_data.push(data);
        update_data_range();
    }

    function update_data_range() {
        if (signal_data.length === 0) return;

        let min = signal_data.get(0);
        let max = signal_data.get(0);

        for (let i = 1; i < signal_data.length; i++) {
            const value = signal_data.get(i);
            if (value < min) min = value;
            if (value > max) max = value;
        }

        // 添加一些边距以避免数据触及边界
        const range = max - min;
        const margin = range > 0 ? range * 0.1 : 0.1;

        data_min = min - margin;
        data_max = max + margin;
    }
</script>

<div
    class="relative box self-start rounded overflow-auto border border-border bg-background"
>
    <canvas
        class="w-full h-full"
        width="500"
        height="300"
        style:image-rendering="smooth"
        {@attach async (cav) => {
            await tick();
            context = cav.getContext("2d");
            cav.width = cav.clientWidth;
            cav.height = cav.clientHeight;
            const gradient = context.createLinearGradient(0, 0, 0, cav.height);
            gradient.addColorStop(0, color + "66");
            gradient.addColorStop(1, color + "00");
            cav.gradient = gradient;
            context.lineWidth = 1;
        }}
        {@attach (cav) => {
            const { stop } = create_renderer(() => {
                if (context) {
                    context.clearRect(0, 0, cav.width, cav.height);
                    context.beginPath();
                    const ypos = (data) => {
                        if (data_max === data_min) return cav.height / 2;
                        return (
                            cav.height *
                            (1 - (data - data_min) / (data_max - data_min))
                        );
                    };
                    context.moveTo(-2, cav.height + 2);
                    const p0 = signal_data.get(0);
                    context.lineTo(-2, ypos(p0));
                    context.lineTo(0, ypos(p0));
                    for (let i = 1; i < signal_data.length; i++) {
                        context.lineTo(
                            cav.width * (i / signal_data.length),
                            ypos(signal_data.get(i)),
                        );
                    }
                    context.lineTo(
                        cav.width + 2,
                        ypos(signal_data.get(signal_data.length - 1)),
                    );
                    context.lineTo(cav.width + 2, cav.height + 2);
                    context.closePath();
                    context.globalAlpha = 1;
                    context.fillStyle = cav.gradient;
                    context.strokeStyle = color;
                    context.fill();
                    context.stroke();
                    const cur_data = signal_data.get(signal_data.length - 1);
                    const prev_data = cav.prev_data ?? cur_data;
                    cav.prev_data = cur_data;
                    context.fillStyle = color;
                    const scaledHeight =
                        (Math.abs(cur_data - prev_data) /
                            (data_max - data_min)) *
                        cav.height;
                    context.globalAlpha = 1 / Math.sqrt(scaledHeight + 1);
                    context.fillRect(
                        0,
                        ypos(Math.max(cur_data, prev_data)) - 1,
                        cav.width,
                        scaledHeight + 2,
                    );
                }
            });
            return stop;
        }}
    ></canvas>
    {#if label}
        <Label
            class="absolute left-2 top-2 whitespace-nowrap text-foreground/50"
        >
            {label}
        </Label>
    {/if}
    <div
        class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 hover:border-primary cursor-se-resize"
        {@attach (e) => {
            if (context) {
                const cav = context.canvas;
                let isDragging = false;
                let startX = 0;
                let startY = 0;
                let startWidth = 0;
                let startHeight = 0;
                const on_start = (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    startWidth = cav.width;
                    startHeight = cav.height;
                };
                const on_move = async (e) => {
                    if (isDragging) {
                        const deltaX = e.clientX - startX;
                        const deltaY = e.clientY - startY;
                        const newWidth = Math.max(100, startWidth + deltaX);
                        const newHeight = Math.max(24, startHeight + deltaY);

                        cav.width = newWidth;
                        cav.height = newHeight;
                        await tick();
                        cav.width = cav.clientWidth;
                        cav.height = cav.clientHeight;
                        const gradient = context.createLinearGradient(
                            0,
                            0,
                            0,
                            cav.height,
                        );
                        gradient.addColorStop(0, color + "66");
                        gradient.addColorStop(1, color + "00");
                        cav.gradient = gradient;
                    }
                };
                const on_end = (e) => {
                    isDragging = false;
                };
                e.addEventListener("mousedown", on_start);
                window.addEventListener("mousemove", on_move);
                window.addEventListener("mouseup", on_end);
                return () => {
                    e.removeEventListener("mousedown", on_start);
                    window.removeEventListener("mousemove", on_move);
                    window.removeEventListener("mouseup", on_end);
                };
            }
        }}
    ></div>
</div>
