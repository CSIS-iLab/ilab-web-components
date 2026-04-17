<svelte:options
  customElement={{
    tag: "csis-translation-lines",
    props: {
      sourceText: { attribute: "source-text", type: "String", reflect: true },
      targetText: { attribute: "target-text", type: "String", reflect: true },
      sourceLang: { attribute: "source-lang", type: "String", reflect: true },
      targetLang: { attribute: "target-lang", type: "String", reflect: true },
      maxWidth: { attribute: "max-width", type: "String", reflect: true },
      fontSize: { attribute: "font-size", type: "String", reflect: true },
      lineHeight: { attribute: "line-height", type: "String", reflect: true },
      fontFamily: { attribute: "font-family", type: "String", reflect: true },
      sourceColor: { attribute: "source-color", type: "String", reflect: true },
      targetColor: { attribute: "target-color", type: "String", reflect: true },
      background: { type: "String", reflect: true },
      borderColor: { attribute: "border-color", type: "String", reflect: true },
      mode: { type: "String", reflect: true },
      lineStagger: { attribute: "line-stagger", type: "Number", reflect: true },
      revealWindow: {
        attribute: "reveal-window",
        type: "Number",
        reflect: true,
      },
      edgeSoftness: {
        attribute: "edge-softness",
        type: "Number",
        reflect: true,
      },
      wheelSensitivity: {
        attribute: "wheel-sensitivity",
        type: "Number",
        reflect: true,
      },
      quoteMark: { attribute: "quote-mark", type: "Boolean", reflect: true },
      debug: { type: "Boolean", reflect: true },
    },
  }}
/>

<script>
  import { onMount } from "svelte";

  let {
    sourceText = "美国门罗主义的政策态势及中拉合作展望",
    targetText = "The Policy Trajectory of the U.S. Monroe Doctrine and Prospects for China–Latin America Cooperation",
    sourceLang = "zh",
    targetLang = "en",
    maxWidth = "48rem",
    fontSize = "clamp(2rem, 3vw + 0.5rem, 3.5rem)",
    lineHeight = "1.15",
    fontFamily = "Inter, ui-sans-serif, system-ui, sans-serif",
    sourceColor = "#7f7f7f",
    targetColor = "#2f7cff",
    background = "#f5f2ee",
    borderColor = "rgba(0, 0, 0, 0.14)",
    mode = "wipe",
    lineStagger = 0.16,
    revealWindow = 0.24,
    edgeSoftness = 4,
    wheelSensitivity = 0.002,
    quoteMark = true,
    debug = false,
  } = $props();

  let rootEl = null;
  let measureEl = null;

  let progress = $state(0);
  let sourceLines = $state([]);
  let targetLines = $state([]);
  let isActiveZone = $state(false);
  let isPointerOver = $state(false);
  let touchY = $state(null);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function tokenize(text, lang) {
    const raw = String(text ?? "");
    if (!raw) return [];

    const segments = raw.split("\n");
    const isCjk = /^(zh|ja|ko)\b/i.test(lang || "");
    const tokens = [];

    for (const segment of segments) {
      if (!segment) {
        tokens.push("\n");
        continue;
      }

      if (isCjk) {
        tokens.push(...Array.from(segment));
      } else {
        tokens.push(...(segment.match(/\S+\s*/g) ?? [segment]));
      }

      tokens.push("\n");
    }

    if (tokens[tokens.length - 1] === "\n") {
      tokens.pop();
    }

    return tokens;
  }

  function measureWrappedLines(text, lang) {
    if (!measureEl) return text ? [text] : [];

    const tokens = tokenize(text, lang);
    if (!tokens.length) return [];

    const lines = [];
    let current = "";

    measureEl.lang = lang || "";

    for (const token of tokens) {
      if (token === "\n") {
        lines.push(current.trimEnd());
        current = "";
        continue;
      }

      const candidate = current + token;
      measureEl.textContent = candidate;

      if (measureEl.scrollWidth <= measureEl.clientWidth || !current) {
        current = candidate;
      } else {
        lines.push(current.trimEnd());
        current = token.trimStart();
      }
    }

    if (current) {
      lines.push(current.trimEnd());
    }

    return lines;
  }

  function updateWrappedLines() {
    if (!measureEl) return;
    sourceLines = measureWrappedLines(sourceText, sourceLang);
    targetLines = measureWrappedLines(targetText, targetLang);
  }

  const lineCount = $derived(Math.max(sourceLines.length, targetLines.length));

  const totalProgressNeeded = $derived(
    Math.max(1, Math.max(lineCount - 1, 0) * lineStagger + revealWindow),
  );

  function getLineProgress(index) {
    const start = index * lineStagger;
    const end = start + revealWindow;
    return clamp((progress - start) / (end - start), 0, 1);
  }

  const lines = $derived(
    Array.from({ length: lineCount }, (_, index) => ({
      index,
      source: sourceLines[index] ?? "",
      target: targetLines[index] ?? "",
      progress: getLineProgress(index),
    })),
  );

  function updateActiveZone() {
    if (!rootEl) return;

    const rect = rootEl.getBoundingClientRect();
    const vh = window.innerHeight;

    const topThreshold = vh * 0.8;
    const bottomThreshold = vh * 0.2;

    isActiveZone = rect.top < topThreshold && rect.bottom > bottomThreshold;
  }

  function applyDelta(delta) {
    const next = clamp(
      progress + delta * wheelSensitivity,
      0,
      totalProgressNeeded,
    );

    const changed = next !== progress;
    progress = next;
    return changed;
  }

  function handleWheel(event) {
    if (!isPointerOver || !isActiveZone) return;

    const changed = applyDelta(event.deltaY);

    if (changed) {
      event.preventDefault();
    }
  }

  function handleTouchStart(event) {
    if (!isActiveZone) return;
    if (event.touches.length !== 1) return;
    touchY = event.touches[0].clientY;
  }

  function handleTouchMove(event) {
    if (!isActiveZone || touchY == null) return;
    if (event.touches.length !== 1) return;

    const currentY = event.touches[0].clientY;
    const delta = touchY - currentY;
    const changed = applyDelta(delta);

    if (changed) {
      event.preventDefault();
      touchY = currentY;
    }
  }

  function handleTouchEnd() {
    touchY = null;
  }

  onMount(() => {
    updateWrappedLines();
    updateActiveZone();

    const handleResize = () => {
      updateWrappedLines();
      updateActiveZone();
    };

    const handleScroll = () => {
      updateActiveZone();
    };

    const resizeObserver = new ResizeObserver(() => {
      updateWrappedLines();
      updateActiveZone();
    });

    if (measureEl) resizeObserver.observe(measureEl);
    if (rootEl) resizeObserver.observe(rootEl);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, { passive: true });

    rootEl?.addEventListener("wheel", handleWheel, { passive: false });
    rootEl?.addEventListener("touchstart", handleTouchStart, { passive: true });
    rootEl?.addEventListener("touchmove", handleTouchMove, { passive: false });
    rootEl?.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);

      rootEl?.removeEventListener("wheel", handleWheel);
      rootEl?.removeEventListener("touchstart", handleTouchStart);
      rootEl?.removeEventListener("touchmove", handleTouchMove);
      rootEl?.removeEventListener("touchend", handleTouchEnd);
    };
  });
</script>

<div
  class="translation-lines"
  bind:this={rootEl}
  onmouseenter={() => (isPointerOver = true)}
  onmouseleave={() => (isPointerOver = false)}
  style:--tl-max-width={maxWidth}
  style:--tl-font-size={fontSize}
  style:--tl-line-height={lineHeight}
  style:--tl-font-family={fontFamily}
  style:--tl-source-color={sourceColor}
  style:--tl-target-color={targetColor}
  style:--tl-background={background}
  style:--tl-border-color={borderColor}
  style:--tl-edge-softness={`${edgeSoftness}px`}
>
  <div class="translation-lines__frame">
    {#if quoteMark}
      <div class="translation-lines__quote" aria-hidden="true">“</div>
    {/if}

    <div class="translation-lines__content">
      <div
        class="translation-lines__measure-probe"
        bind:this={measureEl}
        aria-hidden="true"
      ></div>

      {#each lines as line}
        <div
          class="translation-lines__row"
          class:is-fade={mode === "fade"}
          class:is-wipe={mode !== "fade"}
          class:is-before={line.progress <= 0}
          class:is-active={line.progress > 0 && line.progress < 1}
          class:is-after={line.progress >= 1}
          style={`--line-progress:${line.progress};`}
        >
          <div class="translation-lines__source" lang={sourceLang}>
            {line.source || "\u00A0"}
          </div>

          <div class="translation-lines__target" lang={targetLang}>
            {line.target || "\u00A0"}
          </div>
        </div>
      {/each}
    </div>
  </div>

  {#if debug}
    <div class="translation-lines__debug">
      overall: {progress.toFixed(2)} / {totalProgressNeeded.toFixed(2)}<br />
      source lines: {sourceLines.length}<br />
      target lines: {targetLines.length}<br />
      active zone: {isActiveZone ? "true" : "false"}<br />
      pointer over: {isPointerOver ? "true" : "false"}<br />
      {#each lines as line}
        line {line.index + 1}: {line.progress.toFixed(2)}<br />
      {/each}
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
  }

  .translation-lines {
    position: relative;
    padding: 0 1rem;
  }

  .translation-lines__frame {
    position: relative;
    max-width: var(--tl-max-width, 48rem);
    margin: 0 auto;
    padding: 3rem 2.75rem;
    border: 1px solid var(--tl-border-color, rgba(0, 0, 0, 0.14));
    background: var(--tl-background, #f5f2ee);
  }

  .translation-lines__quote {
    position: absolute;
    top: -0.25em;
    left: 1rem;
    font-size: clamp(5rem, 10vw, 8rem);
    line-height: 1;
    color: rgba(0, 0, 0, 0.045);
    pointer-events: none;
  }

  .translation-lines__content {
    position: relative;
    z-index: 1;
  }

  .translation-lines__measure-probe {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    white-space: nowrap;
    inset: 0;
    width: 100%;
    font-family: var(
      --tl-font-family,
      Inter,
      ui-sans-serif,
      system-ui,
      sans-serif
    );
    font-size: var(--tl-font-size, clamp(2rem, 3vw + 0.5rem, 3.5rem));
    line-height: var(--tl-line-height, 1.15);
    letter-spacing: -0.02em;
  }

  .translation-lines__row {
    position: relative;
    min-height: calc(var(--tl-font-size, 3rem) * var(--tl-line-height, 1.15));
    font-family: var(
      --tl-font-family,
      Inter,
      ui-sans-serif,
      system-ui,
      sans-serif
    );
    font-size: var(--tl-font-size, clamp(2rem, 3vw + 0.5rem, 3.5rem));
    line-height: var(--tl-line-height, 1.15);
    letter-spacing: -0.02em;
    overflow: hidden;
  }

  .translation-lines__source,
  .translation-lines__target {
    position: absolute;
    inset: 0;
    margin: 0;
    white-space: nowrap;
    -webkit-mask-image: none;
    mask-image: none;
  }

  .translation-lines__source {
    color: var(--tl-source-color, #7f7f7f);
    opacity: 1;
  }

  .translation-lines__target {
    color: var(--tl-target-color, #2f7cff);
    opacity: 0;
  }

  .translation-lines__row.is-before .translation-lines__source {
    opacity: 1;
  }

  .translation-lines__row.is-before .translation-lines__target {
    opacity: 0;
  }

  .translation-lines__row.is-after .translation-lines__source {
    opacity: 0;
  }

  .translation-lines__row.is-after .translation-lines__target {
    opacity: 1;
  }

  .translation-lines__row.is-wipe.is-active .translation-lines__source {
    opacity: 1;
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0,
      transparent
        calc((var(--line-progress) * 100%) - var(--tl-edge-softness, 4px)),
      black calc((var(--line-progress) * 100%) + var(--tl-edge-softness, 4px)),
      black 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0,
      transparent
        calc((var(--line-progress) * 100%) - var(--tl-edge-softness, 4px)),
      black calc((var(--line-progress) * 100%) + var(--tl-edge-softness, 4px)),
      black 100%
    );
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }

  .translation-lines__row.is-wipe.is-active .translation-lines__target {
    opacity: 1;
    -webkit-mask-image: linear-gradient(
      to right,
      black 0,
      black calc((var(--line-progress) * 100%) - var(--tl-edge-softness, 4px)),
      transparent
        calc((var(--line-progress) * 100%) + var(--tl-edge-softness, 4px)),
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      black 0,
      black calc((var(--line-progress) * 100%) - var(--tl-edge-softness, 4px)),
      transparent
        calc((var(--line-progress) * 100%) + var(--tl-edge-softness, 4px)),
      transparent 100%
    );
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
  }

  .translation-lines__row.is-fade.is-active .translation-lines__source {
    opacity: calc(1 - var(--line-progress));
  }

  .translation-lines__row.is-fade.is-active .translation-lines__target {
    opacity: var(--line-progress);
  }

  .translation-lines__debug {
    max-width: var(--tl-max-width, 48rem);
    margin: 1rem auto 0;
    padding: 0 1rem;
    font:
      0.875rem/1.4 ui-monospace,
      SFMono-Regular,
      Menlo,
      monospace;
    opacity: 0.75;
  }
</style>