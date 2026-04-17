<svelte:options
  customElement={{
    tag: "csis-translation-lines",
    props: {
      sourceText: { attribute: "source-text", type: "String", reflect: true },
      targetText: { attribute: "target-text", type: "String", reflect: true },
      sourceLang: { attribute: "source-lang", type: "String", reflect: true },
      targetLang: { attribute: "target-lang", type: "String", reflect: true },
      height: { type: "Number", reflect: true },
      stickyTop: { attribute: "sticky-top", type: "String", reflect: true },
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
      quoteMark: { attribute: "quote-mark", type: "Boolean", reflect: true },
      debug: { type: "Boolean", reflect: true },
    },
  }}
/>

<script>
  import { onMount } from "svelte";

  let {
    sourceText = "在某个阶段\n我们应该预期\n机器将会\n接管控制。",
    targetText = "At some stage therefore\nwe should have to\nexpect the machines\nto take control.",
    sourceLang = "zh",
    targetLang = "en",
    height = 220,
    stickyTop = "18vh",
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
    quoteMark = true,
    debug = false,
  } = $props();

  let rootEl = null;
  let progress = $state(0);

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function splitLines(text) {
    return String(text ?? "")
      .split("\n")
      .map((line) => line.trim());
  }

function updateProgress() {
  if (!rootEl) return;

  const rect = rootEl.getBoundingClientRect();
  const vh = window.innerHeight;

  const totalScrollable = Math.max(rect.height - vh, 1);
  const raw = -rect.top / totalScrollable;

  progress = clamp(raw, 0, 1);
}
  function getLineProgress(index) {
    const start = index * lineStagger;
    const end = start + revealWindow;
    return clamp((progress - start) / (end - start), 0, 1);
  }

  const sourceLines = $derived(splitLines(sourceText));
  const targetLines = $derived(splitLines(targetText));
  const lineCount = $derived(Math.max(sourceLines.length, targetLines.length));

  const lines = $derived(
    Array.from({ length: lineCount }, (_, index) => ({
      index,
      source: sourceLines[index] ?? "",
      target: targetLines[index] ?? "",
      progress: getLineProgress(index),
    })),
  );

  onMount(() => {
    updateProgress();

    const handleScroll = () => updateProgress();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  });
</script>

<div
  class="translation-lines"
  bind:this={rootEl}
  style:--tl-height={`${height}vh`}
  style:--tl-sticky-top={stickyTop}
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
  <div class="translation-lines__sticky">
    <div class="translation-lines__frame">
      {#if quoteMark}
        <div class="translation-lines__quote" aria-hidden="true">“</div>
      {/if}

      <div class="translation-lines__content">
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
        overall: {progress.toFixed(2)}<br />
        {#each lines as line}
          line {line.index + 1}: {line.progress.toFixed(2)}<br />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  :host {
    display: block;
  }

  .translation-lines {
    position: relative;
    height: var(--tl-height, 220vh);
    background: var(--tl-background, #f5f2ee);
  }

  .translation-lines__sticky {
    position: sticky;
    top: var(--tl-sticky-top, 18vh);
    padding: 0 1rem;
  }

  .translation-lines__frame {
    position: relative;
    max-width: var(--tl-max-width, 48rem);
    margin: 0 auto;
    padding: 3rem 2.75rem;
    border: 1px solid var(--tl-border-color, rgba(0, 0, 0, 0.14));
    background: transparent;
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
    -webkit-mask-image: none;
    mask-image: none;
  }

  .translation-lines__row.is-before .translation-lines__target {
    opacity: 0;
    -webkit-mask-image: none;
    mask-image: none;
  }

  .translation-lines__row.is-after .translation-lines__source {
    opacity: 0;
    -webkit-mask-image: none;
    mask-image: none;
  }

  .translation-lines__row.is-after .translation-lines__target {
    opacity: 1;
    -webkit-mask-image: none;
    mask-image: none;
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
