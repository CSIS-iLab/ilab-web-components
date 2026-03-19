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

      animationDuration: {
        attribute: "animation-duration",
        type: "Number",
        reflect: true,
      },
    },
  }}
/>

<script>
  import { onMount, onDestroy } from "svelte";
  import { gsap } from "gsap";

  export let title = "YOUR HEADLINE HERE";
  export let subtitle = "";
  export let minPercent = 0;
  export let maxPercent = 50;
  export let initialPercent = 10;
  export let minValue = 0;
  export let maxValue = 2550412;
  export let step = 1;
  export let prefix = "";
  export let suffix = "";
  export let dataJson = "";

  export let size = 720;

  export let bgColor = "#ffffff";
  export let outerRingColor = "#9adce4";
  export let tickColor = "#57c7d5";
  export let labelColor = "#57c7d5";
  export let inactiveArcColor = "#f1f1f1";
  export let activeArcColor = "#4cb6c3";
  export let knobColor = "#ffffff";
  export let knobIconColor = "#18323a";
  export let titleColor = "#57c7d5";
  export let valueColor = "#57c7d5";

  export let fontFamily = "'IBM Plex Sans', system-ui, sans-serif";

  export let animationDuration = 1;

  const cx = 360;
  const cy = 360;
  const outerRingR = 235;
  const dialR = 210;
  const knobR = 268;
  const tickHeight = 14;
  const tickWidth = 1.5;

  let svgEl;
  let dragging = false;
  let parsedData = [];
  // let currentPercent = clampAndSnap(initialPercent);
  let currentPercent = 0;
  let currentValue = 0;

  let outerRingEl;
  let inactiveRingEl;
  let activePathEl;
  let tickEls = [];
  let tickLabelEls = [];
  let centerPercentEl;
  let headlineEl;
  let valueEl;
  let stemEl;
  let knobGroupEl;
  let introTl;

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
    const clamped = clamp(percent, 0, 100);
    return (clamped / 100) * 360;
  }

  function angleToPercent(angle) {
    const normalized = ((angle % 360) + 360) % 360;
    return (normalized / 360) * 100;
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
    if (angle < 0) angle += 360;
    return angle;
  }

  function setPercentFromPointer(clientX, clientY) {
    const rawAngle = getPointerAngle(clientX, clientY);

    const minAngle = percentToAngle(minPercent);
    const maxAngle = percentToAngle(maxPercent);

    let clampedAngle = rawAngle;

    // If pointer is outside the allowed arc, clamp to the nearest end
    if (rawAngle < minAngle || rawAngle > maxAngle) {
      const distToMin = Math.min(
        Math.abs(rawAngle - minAngle),
        360 - Math.abs(rawAngle - minAngle),
      );

      const distToMax = Math.min(
        Math.abs(rawAngle - maxAngle),
        360 - Math.abs(rawAngle - maxAngle),
      );

      clampedAngle = distToMin <= distToMax ? minAngle : maxAngle;
    }

    currentPercent = clampAndSnap(angleToPercent(clampedAngle));
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

  function getTickPercents() {
    const ticks = [];

    for (let p = 0; p <= maxPercent; p += 10) {
      ticks.push(p);
    }

    if (maxPercent % 10 !== 0 && !ticks.includes(maxPercent)) {
      ticks.push(maxPercent);
    }

    return ticks;
  }

  function animateToPercent(targetPercent, duration = 1.2) {
    const state = { value: currentPercent };

    gsap.to(state, {
      value: clampAndSnap(targetPercent),
      duration,
      ease: "power2.out",
      onUpdate: () => {
        currentPercent = state.value;
        updateValue();
      },
    });
  }

  function setCircleDraw(el, radius) {
    if (!el) return 0;

    const length = 2 * Math.PI * radius;
    el.style.strokeDasharray = `${length}`;
    el.style.strokeDashoffset = `${length}`;
    return length;
  }

  $: tickPercents = getTickPercents();
  $: parseData();
  $: updateValue();
  $: progressAngle = percentToAngle(currentPercent);

  $: activePath =
    progressAngle === 0
      ? ""
      : progressAngle >= 360
        ? describeArc(cx, cy, dialR, 0, 359.999)
        : describeArc(cx, cy, dialR, 0, progressAngle);

  $: knobPoint = polarToCartesian(cx, cy, knobR, progressAngle);

  const knobVisibleR = 19.5;
  const activeStrokeWidth = 10;
  const stemStrokeWidth = 1.5;

  $: stemInner = polarToCartesian(
    cx,
    cy,
    dialR - activeStrokeWidth / 2 + stemStrokeWidth / 2,
    progressAngle,
  );

  $: stemOuter = polarToCartesian(cx, cy, knobR - knobVisibleR, progressAngle);

  onMount(() => {
    updateValue();

    tickEls = tickEls.filter(Boolean);
    tickLabelEls = tickLabelEls.filter(Boolean);

    setCircleDraw(outerRingEl, outerRingR);
    setCircleDraw(inactiveRingEl, dialR);

    introTl = gsap.timeline({
      defaults: {
        ease: "power2.out",
        duration: animationDuration,
      },
    });

    // hide things before animating
    gsap.set([centerPercentEl, headlineEl, valueEl, stemEl, knobGroupEl], {
      opacity: 0,
    });

    gsap.set(tickEls, {
      opacity: 1,
      rotation: 0,
      svgOrigin: `${cx} ${cy}`,
    });

    gsap.set(tickLabelEls, {
      opacity: 0,
      y: -12,
    });

    gsap.set(knobGroupEl, {
      scale: 0.85,
      transformOrigin: "center center",
    });

    gsap.set(stemEl, {
      opacity: 0,
    });

    introTl
      .to(inactiveRingEl, {
        strokeDashoffset: 0,
        duration: 0.8 * animationDuration,
        ease: "power4.inOut",
      })
      .to(
        outerRingEl,
        {
          strokeDashoffset: 0,
          duration: 0.8 * animationDuration,
          ease: "power4.inOut",
        },
        "-=0.6",
      )
      .to(
        tickEls,
        {
          duration: 0.8 * animationDuration,
          stagger: 0.1,
          ease: "power2.out",
          rotation: (i) => percentToAngle(tickPercents[i]),
          svgOrigin: `${cx} ${cy}`,
        },
        "-=0.4",
      )
      .to(
        tickLabelEls,
        {
          opacity: 1,
          y: 0,
          duration: 0.35 * animationDuration,
          stagger: 0.05,
        },
        "-=0.2",
      )
      .to(
        [centerPercentEl, headlineEl, valueEl],
        {
          opacity: 1,
          y: 0,
          duration: 0.45 * animationDuration,
          stagger: 0.08,
        },
        "-=0.2",
      )
      .to(
        stemEl,
        {
          opacity: 1,
          duration: 0.25 * animationDuration,
        },
        "-=0.15",
      )
      .to(
        knobGroupEl,
        {
          opacity: 1,
          scale: 1,
          duration: 0.35 * animationDuration,
        },
        "-=0.1",
      )
      .add(() => {
        animateToPercent(initialPercent, 1.1 * animationDuration);
      }, "-=0.05");
  });

  onDestroy(() => {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);

    if (introTl) introTl.kill();
    gsap.killTweensOf("*");
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
      bind:this={outerRingEl}
      {cx}
      {cy}
      r={outerRingR}
      fill="none"
      stroke={outerRingColor}
      stroke-width="1.5"
      opacity="0.9"
      transform={`rotate(-90 ${cx} ${cy})`}
    />
    <circle
      bind:this={inactiveRingEl}
      {cx}
      {cy}
      r={dialR}
      fill="none"
      stroke={inactiveArcColor}
      stroke-width="10"
      transform={`rotate(-90 ${cx} ${cy})`}
    />

    {#if activePath}
      <path
        bind:this={activePathEl}
        d={activePath}
        fill="none"
        stroke={activeArcColor}
        stroke-width="10"
        stroke-linecap="butt"
      />
    {/if}
    <!-- marker ticks + labels -->
    {#each tickPercents as p, i}
      {@const a = percentToAngle(p)}
      {@const label = polarToCartesian(cx, cy, outerRingR + 38, a)}

      <rect
        bind:this={tickEls[i]}
        x={cx - tickWidth / 2}
        y={cy - outerRingR - tickHeight}
        width={tickWidth}
        height={tickHeight}
        fill={tickColor}
      />

      <text
        bind:this={tickLabelEls[i]}
        x={label.x}
        y={label.y}
        fill={labelColor}
        font-size="18"
        text-anchor="middle"
        dominant-baseline="middle"
      >
        {p}%
      </text>
    {/each}
    <!-- center percent -->
    <text
      bind:this={centerPercentEl}
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
      bind:this={headlineEl}
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
      bind:this={valueEl}
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
      bind:this={stemEl}
      x1={stemInner.x}
      y1={stemInner.y}
      x2={stemOuter.x}
      y2={stemOuter.y}
      stroke={activeArcColor}
      stroke-width="1.5"
      stroke-linecap="square"
    />

    <!-- knob -->
    <g
      bind:this={knobGroupEl}
      transform={`translate(${knobPoint.x} ${knobPoint.y}) rotate(${progressAngle})`}
      class="knob-group"
      on:pointerdown={handlePointerDown}
    >
      <circle
        class="knob-visible"
        r="20"
        fill={knobColor}
        stroke={activeArcColor}
        stroke-width="1.5"
      />
      <circle r="30" fill="transparent" />

      <g class="knob-icon" fill={knobIconColor} pointer-events="none">
        <rect x="-9" y="-0.5" width="18" height="1" />
        <polygon
          points="-6.73,3.18 -6,2.48 -8.55,0 -6,-2.47 -6.73,-3.18 -10,0"
        />
        <polygon points="6.73,3.18 6,2.48 8.55,0 6,-2.47 6.73,-3.18 10,0" />
      </g>
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
