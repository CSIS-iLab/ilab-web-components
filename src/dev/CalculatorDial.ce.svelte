<svelte:options
  customElement={{
    tag: "csis-dial-calculator",
    props: {
      title: { type: "String", reflect: true },
      subtitle: { type: "String", reflect: true },
      minPercent: { attribute: "min-percent", type: "Number", reflect: true },
      maxPercent: { attribute: "max-percent", type: "Number", reflect: true },
      initialPercent: {
        attribute: "initial-percent",
        type: "Number",
        reflect: true,
      },
      minValue: { attribute: "min-value", type: "Number", reflect: true },
      maxValue: { attribute: "max-value", type: "Number", reflect: true },
      step: { type: "Number", reflect: true },
      prefix: { type: "String", reflect: true },
      suffix: { type: "String", reflect: true },
      dataJson: { attribute: "data-json", type: "String", reflect: true },

      size: { type: "Number", reflect: true },

      bgColor: { attribute: "bg-color", type: "String", reflect: true },
      outerRingColor: {
        attribute: "outer-ring-color",
        type: "String",
        reflect: true,
      },
      tickColor: { attribute: "tick-color", type: "String", reflect: true },
      labelColor: { attribute: "label-color", type: "String", reflect: true },
      inactiveArcColor: {
        attribute: "inactive-arc-color",
        type: "String",
        reflect: true,
      },
      activeArcColor: {
        attribute: "active-arc-color",
        type: "String",
        reflect: true,
      },
      dashedArcColor: {
        attribute: "dashed-arc-color",
        type: "String",
        reflect: true,
      },
      knobColor: { attribute: "knob-color", type: "String", reflect: true },
      knobIconColor: {
        attribute: "knob-icon-color",
        type: "String",
        reflect: true,
      },
      titleColor: { attribute: "title-color", type: "String", reflect: true },
      valueColor: { attribute: "value-color", type: "String", reflect: true },

      fontFamily: { attribute: "font-family", type: "String", reflect: true },
    },
  }}
/>

<script>
  import { onDestroy } from "svelte";

  export let title = "YOUR HEADLINE HERE";
  export let subtitle = "";
  export let minPercent = 0;
  export let maxPercent = 50;
  export let initialPercent = 50;
  export let minValue = 0;
  export let maxValue = 2550412;
  export let step = 1;
  export let prefix = "$";
  export let suffix = "";
  export let dataJson = "";

  export let size = 720;

  export let bgColor = "#ffffff";
  export let outerRingColor = "#9adce4";
  export let tickColor = "#57c7d5";
  export let labelColor = "#57c7d5";
  export let inactiveArcColor = "#f1f1f1";
  export let activeArcColor = "#4cb6c3";
  export let dashedArcColor = "#d9eef1";
  export let knobColor = "#ffffff";
  export let knobIconColor = "#18323a";
  export let titleColor = "#57c7d5";
  export let valueColor = "#57c7d5";

  export let fontFamily = "'IBM Plex Sans', system-ui, sans-serif";

  const cx = 360;
  const cy = 360;
  const outerRingR = 245;
  const dialR = 210;
  const dashedR = 184;
  const knobR = 268;

  let svgEl;
  let dragging = false;
  let parsedData = [];
  let currentPercent = clampAndSnap(initialPercent);
  let currentValue = 0;

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function clampAndSnap(value) {
    const safeStep = step || 1;
    const snapped = Math.round(value / safeStep) * safeStep;
    return clamp(snapped, minPercent, maxPercent);
  }

  function polarToCartesian(centerX, centerY, r, angleDeg) {
    const angleRad = (angleDeg - 90) * (Math.PI / 180);
    return {
      x: centerX + r * Math.cos(angleRad),
      y: centerY + r * Math.sin(angleRad),
    };
  }

  function describeArc(centerX, centerY, r, startAngle, endAngle) {
    const start = polarToCartesian(centerX, centerY, r, endAngle);
    const end = polarToCartesian(centerX, centerY, r, startAngle);
    const delta = endAngle - startAngle;
    const largeArcFlag = Math.abs(delta) <= 180 ? "0" : "1";
    const sweepFlag = delta >= 0 ? "0" : "1";

    return [
      "M",
      start.x,
      start.y,
      "A",
      r,
      r,
      0,
      largeArcFlag,
      sweepFlag,
      end.x,
      end.y,
    ].join(" ");
  }

  function percentToAngle(percent) {
    const range = maxPercent - minPercent || 1;
    const t = (percent - minPercent) / range;
    return t * 180; // 👈 key change
  }

  function angleToPercent(angle) {
    const range = maxPercent - minPercent || 1;
    return minPercent + (angle / 180) * range;
  }

  function parseData() {
    if (!dataJson?.trim()) {
      parsedData = [];
      return;
    }

    try {
      const data = JSON.parse(dataJson);
      parsedData = Array.isArray(data)
        ? data
            .map((item) => ({
              percent: Number(item.percent),
              value: Number(item.value),
            }))
            .filter(
              (item) =>
                Number.isFinite(item.percent) && Number.isFinite(item.value),
            )
            .sort((a, b) => a.percent - b.percent)
        : [];
    } catch (error) {
      parsedData = [];
      console.warn("csis-dial-calculator: invalid data-json", error);
    }
  }

  function interpolateValue(percent) {
    if (!parsedData.length) {
      const range = maxPercent - minPercent || 1;
      const t = (percent - minPercent) / range;
      return Math.round(minValue + t * (maxValue - minValue));
    }

    if (percent <= parsedData[0].percent) return parsedData[0].value;
    if (percent >= parsedData[parsedData.length - 1].percent) {
      return parsedData[parsedData.length - 1].value;
    }

    for (let i = 0; i < parsedData.length - 1; i += 1) {
      const a = parsedData[i];
      const b = parsedData[i + 1];

      if (percent >= a.percent && percent <= b.percent) {
        const span = b.percent - a.percent || 1;
        const t = (percent - a.percent) / span;
        return Math.round(a.value + t * (b.value - a.value));
      }
    }

    return 0;
  }

  function formatValue(value) {
    return `${prefix}${Number(value).toLocaleString("en-US")}${suffix}`;
  }

  function updateValue() {
    currentPercent = clampAndSnap(currentPercent);
    currentValue = interpolateValue(currentPercent);
  }

  function getPointerAngle(clientX, clientY) {
    const rect = svgEl.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 720;
    const y = ((clientY - rect.top) / rect.height) * 720;

    let angle = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 90;

    // 👇 clamp to 0–180 (right side only)
    angle = Math.max(0, Math.min(180, angle));

    return angle;
  }

  function setPercentFromPointer(clientX, clientY) {
    currentPercent = angleToPercent(getPointerAngle(clientX, clientY));
    updateValue();
  }

  function handlePointerDown(event) {
    dragging = true;
    event.preventDefault();
    setPercentFromPointer(event.clientX, event.clientY);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }

  function handlePointerMove(event) {
    if (!dragging) return;
    setPercentFromPointer(event.clientX, event.clientY);
  }

  function handlePointerUp() {
    dragging = false;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  function markerPercent(index, total) {
    if (total <= 1) return minPercent;
    return minPercent + ((maxPercent - minPercent) / (total - 1)) * index;
  }

  $: parseData();
  $: updateValue();
  $: progressAngle = percentToAngle(currentPercent);

  // 0% at top, 50% at bottom, matching the original
  $: activePath = describeArc(cx, cy, dialR, 0, progressAngle);
  $: inactivePath = describeArc(cx, cy, dialR, progressAngle, 180);
  $: fullBackground = describeArc(cx, cy, dialR, 180, 360);
  $: dashedTopPath = describeArc(cx, cy, dashedR, 350, 25);

  $: knobPoint = polarToCartesian(cx, cy, knobR, progressAngle);
  $: stemInner = polarToCartesian(cx, cy, dialR + 2, progressAngle);
  $: stemOuter = polarToCartesian(cx, cy, knobR - 28, progressAngle);

  onDestroy(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  });
</script>

<div
  class="dial-wrapper"
  style:background-color={bgColor}
  style:font-family={fontFamily}
>
  <svg
    bind:this={svgEl}
    class="dial"
    viewBox="0 0 720 720"
    role="img"
    aria-label="Interactive dial calculator"
  >
    <!-- outer guide ring -->
    <circle
      {cx}
      {cy}
      r={outerRingR}
      fill="none"
      stroke={outerRingColor}
      stroke-width="2"
      opacity="0.9"
    />

    <path
      d={fullBackground}
      fill="none"
      stroke={inactiveArcColor}
      stroke-width="10"
    />
    <!-- inactive right side -->
    <path
      d={inactivePath}
      fill="none"
      stroke={inactiveArcColor}
      stroke-width="10"
    />

    <!-- active ring -->
    <path
      d={activePath}
      fill="none"
      stroke={activeArcColor}
      stroke-width="10"
      stroke-linecap="round"
    />

    <!-- marker ticks + labels -->
    {#each Array(6) as _, i}
      {@const p = markerPercent(i, 6)}
      {@const a = percentToAngle(p)}
      {@const tickStart = polarToCartesian(cx, cy, outerRingR, a)}
      {@const tickEnd = polarToCartesian(cx, cy, outerRingR + 14, a)}
      {@const label = polarToCartesian(cx, cy, outerRingR + 38, a)}

      <line
        x1={tickStart.x}
        y1={tickStart.y}
        x2={tickEnd.x}
        y2={tickEnd.y}
        stroke={tickColor}
        stroke-width="2"
      />

      <text
        x={label.x}
        y={label.y}
        fill={labelColor}
        font-size="18"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {Math.round(p)}%
      </text>
    {/each}

    <!-- center percent -->
    <text
      x="360"
      y="250"
      fill={valueColor}
      text-anchor="middle"
      class="percent-line"
    >
      <tspan class="percent-value">{Math.round(currentPercent)}</tspan>
      <tspan class="percent-symbol" dx="4">%</tspan>
    </text>

    <!-- center headline -->
    <text
      x="360"
      y="315"
      fill={titleColor}
      text-anchor="middle"
      class="title-line"
    >
      <tspan x="360" dy="0">{title}</tspan>
      {#if subtitle}
        <tspan x="360" dy="28">{subtitle}</tspan>
      {/if}
    </text>

    <!-- value -->
    <text
      x="360"
      y="405"
      fill={valueColor}
      text-anchor="middle"
      class="result-line"
    >
      {formatValue(currentValue)}
    </text>

    <!-- stem -->
    <line
      x1={stemInner.x}
      y1={stemInner.y}
      x2={stemOuter.x}
      y2={stemOuter.y}
      stroke={tickColor}
      stroke-width="2"
    />

    <!-- knob -->
    <g
      transform={`translate(${knobPoint.x} ${knobPoint.y})`}
      class="knob-group"
      on:pointerdown={handlePointerDown}
    >
      <circle r="22" fill={knobColor} />
      <circle r="30" fill="transparent" />
      <text
        x="0"
        y="2"
        text-anchor="middle"
        dominant-baseline="middle"
        fill={knobIconColor}
        class="knob-icon"
      >
        ↔
      </text>
    </g>
  </svg>
</div>

<style>
  .dial-wrapper {
    width: 100%;
    max-width: 760px;
    margin: 0 auto;
  }

  .dial {
    display: block;
    width: 100%;
    height: auto;
    overflow: visible;
    user-select: none;
    touch-action: none;
  }

  .percent-line {
    font-variant-numeric: tabular-nums;
  }

  .percent-value {
    font-size: 56px;
    font-weight: 700;
  }

  .percent-symbol {
    font-size: 28px;
    font-weight: 700;
  }

  .title-line {
    font-size: 20px;
    font-weight: 400;
    text-transform: uppercase;
  }

  .result-line {
    font-size: 52px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  .knob-group {
    cursor: grab;
  }

  .knob-group:active {
    cursor: grabbing;
  }

  .knob-icon {
    font-size: 20px;
    font-weight: 700;
  }
</style>
