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
        emitter = readable([0, 0]),
        duration = 1000,
        color: p_color = colors[0 | (Math.random() * colors.length)],
    } = $props();

    let s_color = to_readable(p_color);
    let color = $derived($s_color);

    let xy_data = new CircularBuffer(duration);
    let x_min = $state(0);
    let x_max = $state(1);
    let y_min = $state(0);
    let y_max = $state(1);

    /** @type {CanvasRenderingContext2D} */
    let context = $state();

    onMount(() => {
        const unsubscribe = emitter.subscribe((value) => {
            if (Array.isArray(value) && value.length === 2) {
                add_data(value);
            }
        });
        return () => {
            unsubscribe();
        };
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
        xy_data.push(data);
        update_data_range();
    }

    function update_data_range() {
        if (xy_data.length === 0) return;

        let minX = xy_data.get(0)[0] ?? 0;
        let maxX = xy_data.get(0)[0] ?? 1;
        let minY = xy_data.get(0)[1] ?? 0;
        let maxY = xy_data.get(0)[1] ?? 1;

        for (let i = 1; i < xy_data.length; i++) {
            const [x, y] = xy_data.get(i);
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
        }

        // 添加一些边距以避免数据触及边界
        const xRange = maxX - minX;
        const yRange = maxY - minY;
        const xMargin = xRange > 0 ? xRange * 0.1 : 0.1;
        const yMargin = yRange > 0 ? yRange * 0.1 : 0.1;

        x_min = minX - xMargin;
        x_max = maxX + xMargin;
        y_min = minY - yMargin;
        y_max = maxY + yMargin;
    }

    function transformX(x, width) {
        if (x_max === x_min) return width / 2;
        return (width * (x - x_min)) / (x_max - x_min);
    }

    function transformY(y, height) {
        if (y_max === y_min) return height / 2;
        return height * (1 - (y - y_min) / (y_max - y_min));
    }
</script>

<div
    class="relative box self-start rounded overflow-auto border border-border bg-background"
>
    <canvas
        class="w-full h-full"
        width="500"
        height="500"
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
                if (context && xy_data.length > 0) {
                    context.clearRect(0, 0, cav.width, cav.height);

                    // Draw trajectory line
                    if (xy_data.length > 1) {
                        context.beginPath();

                        const [firstX, firstY] = xy_data.get(0);
                        context.moveTo(
                            transformX(firstX, cav.width),
                            transformY(firstY, cav.height),
                        );

                        for (let i = 1; i < xy_data.length; i++) {
                            const [x, y] = xy_data.get(i);
                            context.lineTo(
                                transformX(x, cav.width),
                                transformY(y, cav.height),
                            );
                        }

                        context.strokeStyle = color;
                        context.stroke();
                    }
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
