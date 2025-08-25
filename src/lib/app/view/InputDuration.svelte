<script lang="ts">
    import Input from "$lib/components/ui/input/input.svelte";
    import Label from "$lib/components/ui/label/label.svelte";
    import { to_writable } from "$lib/utils";

    let {
        label = "",
        value = "00:00:00",
        max = "23:59:59",
        min = "00:00:00",
    }: {
        label?: string;
        value?: string;
        max?: string;
        min?: string;
    } = $props();

    let rvalue = to_writable(value);

    function parseTimeString(timeStr: string): {
        hours: number;
        minutes: number;
        seconds: number;
    } {
        const parts = timeStr.split(":");
        return {
            hours: parseInt(parts[0] || "0", 10),
            minutes: parseInt(parts[1] || "0", 10),
            seconds: parseInt(parts[2] || "0", 10),
        };
    }

    function isValidTime(timeStr: string): boolean {
        const { hours, minutes, seconds } = parseTimeString(timeStr);
        return (
            hours >= 0 &&
            hours <= 23 &&
            minutes >= 0 &&
            minutes <= 59 &&
            seconds >= 0 &&
            seconds <= 59
        );
    }

    function validateAndSetValue(inputValue: string) {
        if (isValidTime(inputValue)) {
            const { hours, minutes, seconds } = parseTimeString(inputValue);
            const minTime = parseTimeString(min);
            const maxTime = parseTimeString(max);

            // Convert to total seconds for comparison
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            const minTotalSeconds =
                minTime.hours * 3600 + minTime.minutes * 60 + minTime.seconds;
            const maxTotalSeconds =
                maxTime.hours * 3600 + maxTime.minutes * 60 + maxTime.seconds;

            if (
                totalSeconds >= minTotalSeconds &&
                totalSeconds <= maxTotalSeconds
            ) {
                rvalue.set(inputValue);
            }
        }
    }

    function handleInput(event: Event) {
        const target = event.target as HTMLInputElement;
        validateAndSetValue(target.value);
    }
</script>

<div class="box-fill gap-1.5">
    {#if label}
        <Label>{label}</Label>
    {/if}

    <Input
        type="time"
        step="1"
        value={$rvalue}
        oninput={handleInput}
        {min}
        {max}
        placeholder="选择时长"
    />
</div>
