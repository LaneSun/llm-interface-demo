<script lang="ts">
    import { onMount, onDestroy } from "svelte";

    let {
        label = "",
        duration = "00:10:00",
        color = "#3b82f6",
    }: {
        label?: string;
        duration?: string;
        color?: string;
    } = $props();

    let canvasElement: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D | null = null;
    let animationFrameId: number;
    let startTime = Date.now();

    // Parse duration string to milliseconds
    function parseDuration(durationStr: string): number {
        const parts = durationStr.split(":");
        const hours = parseInt(parts[0] || "0", 10);
        const minutes = parseInt(parts[1] || "0", 10);
        const seconds = parseInt(parts[2] || "0", 10);
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    const durationMs = parseDuration(duration);

    // Generate sample waveform data
    function generateWaveformData(
        width: number,
        currentTime: number,
    ): number[] {
        const data: number[] = [];
        const frequency1 = 0.02;
        const frequency2 = 0.05;
        const amplitude = 0.4;

        for (let i = 0; i < width; i++) {
            const x = i + currentTime * 0.1;
            const wave1 = Math.sin(x * frequency1) * amplitude;
            const wave2 = Math.sin(x * frequency2) * amplitude * 0.5;
            const noise = (Math.random() - 0.5) * 0.1;
            data.push((wave1 + wave2 + noise) * 0.8);
        }

        return data;
    }

    function drawWaveform() {
        if (!ctx || !canvasElement) return;

        const width = canvasElement.width;
        const height = canvasElement.height;
        const centerY = height / 2;
        const currentTime = Date.now() - startTime;

        // Clear canvas
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(0, 0, width, height);

        // Draw grid
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let y = 0; y <= height; y += height / 8) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Vertical grid lines
        for (let x = 0; x <= width; x += width / 10) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Center line
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Generate and draw waveform
        const waveformData = generateWaveformData(width, currentTime);

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        for (let i = 0; i < waveformData.length; i++) {
            const x = i;
            const y = centerY + waveformData[i] * (height * 0.3);

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }

        ctx.stroke();

        // Draw time markers
        ctx.fillStyle = "#64748b";
        ctx.font = "12px monospace";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";

        const elapsedSeconds = Math.floor(currentTime / 1000);
        const timeText = `${Math.floor(elapsedSeconds / 60)
            .toString()
            .padStart(
                2,
                "0",
            )}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;
        ctx.fillText(timeText, 10, height - 10);

        // Continue animation
        animationFrameId = requestAnimationFrame(drawWaveform);
    }

    function resizeCanvas() {
        if (!canvasElement) return;

        const rect = canvasElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        canvasElement.width = rect.width * dpr;
        canvasElement.height = rect.height * dpr;

        if (ctx) {
            ctx.scale(dpr, dpr);
        }
    }

    onMount(() => {
        if (canvasElement) {
            ctx = canvasElement.getContext("2d");
            resizeCanvas();
            drawWaveform();

            window.addEventListener("resize", resizeCanvas);
        }
    });

    onDestroy(() => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        window.removeEventListener("resize", resizeCanvas);
    });
</script>

<div class="waveform-chart-container">
    {#if label}
        <div class="chart-header">
            <h3 class="chart-label">{label}</h3>
            <div class="chart-controls">
                <span class="duration-display">时长: {duration}</span>
            </div>
        </div>
    {/if}

    <div class="chart-wrapper">
        <canvas bind:this={canvasElement} class="waveform-canvas"></canvas>
    </div>
</div>

<style>
    .waveform-chart-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        height: 300px;
        background-color: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .chart-label {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: #374151;
    }

    .chart-controls {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .duration-display {
        font-size: 12px;
        color: #6b7280;
        font-family: monospace;
        background-color: #f3f4f6;
        padding: 4px 8px;
        border-radius: 4px;
    }

    .chart-wrapper {
        flex: 1;
        position: relative;
        overflow: hidden;
        border-radius: 6px;
    }

    .waveform-canvas {
        width: 100%;
        height: 100%;
        display: block;
        cursor: crosshair;
    }
</style>
