<svelte:options
  customElement={{
    tag: "csis-scroll-text-stack",
    props: {
      bottomText: { attribute: "bottom-text", type: "String", reflect: true },
      topText: { attribute: "top-text", type: "String", reflect: true },
      bottomColor: { attribute: "bottom-color", type: "String", reflect: true },
      topColor: { attribute: "top-color", type: "String", reflect: true },
      maskColor: { attribute: "mask-color", type: "String", reflect: true },
      start: { type: "String", reflect: true },
      end: { type: "String", reflect: true },
      markers: { type: "Boolean", reflect: true },
      maxWidth: { attribute: "max-width", type: "String", reflect: true },
      fontSize: { attribute: "font-size", type: "String", reflect: true },
      lineHeight: { attribute: "line-height", type: "String", reflect: true },
      fontWeight: { attribute: "font-weight", type: "String", reflect: true },
      fontFamily: { attribute: "font-family", type: "String", reflect: true },
    },
  }}
/>

<script>
  import { onMount, tick } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let {
    bottomText = "Translated text",
    topText = "Original text",
    bottomColor = "#000000",
    topColor = "#fff",
    maskColor = "#333",
    start = "top 80%",
    end = "+=1400",
    markers = false,
    maxWidth = "800px",
    fontSize = "1.5rem",
    lineHeight = "1.2",
    fontWeight = "400",
    fontFamily = "inherit",
  } = $props();

  // split topText into an array
  let topChars = $derived(Array.from(topText));
  let detectedTopLines = $state([]);
  let topMeasureEl;
  // split bottomText into an array
  let bottomWords = $derived(bottomText.split(" "));
  let detectedBottomLines = $state([]);
  let measureEl;

  let wrapperEl;
  let topMaskEl;

  function buildBottomLines() {
    if (!measureEl) return;

    const wordSpans = Array.from(measureEl.querySelectorAll(".measure-word"));

    if (!wordSpans.length) {
      detectedBottomLines = [{ text: bottomText, width: 0 }];
      return;
    }

    const grouped = [];
    let currentTop = null;
    let currentSpans = [];

    for (const span of wordSpans) {
      const top = span.offsetTop;

      if (currentTop === null) {
        currentTop = top;
      }

      if (top !== currentTop) {
        grouped.push(currentSpans);
        currentSpans = [];
        currentTop = top;
      }

      currentSpans.push(span);
    }

    if (currentSpans.length) {
      grouped.push(currentSpans);
    }

    detectedBottomLines = grouped.map((spans) => {
      const text = spans.map((span) => span.dataset.word ?? "").join(" ");

      const first = spans[0];
      const last = spans[spans.length - 1];

      const left = first.offsetLeft;
      const width = last.offsetLeft + last.offsetWidth - left;

      return {
        text,
        width,
      };
    });
  }

  function buildTopLines() {
    if (!topMeasureEl) return;

    const charSpans = Array.from(
      topMeasureEl.querySelectorAll(".measure-top-char"),
    );

    if (!charSpans.length) {
      detectedTopLines = [topText];
      return;
    }

    const lines = [];
    let currentTop = null;
    let currentChars = [];

    for (const span of charSpans) {
      const top = span.offsetTop;
      const char = span.dataset.char ?? "";

      if (currentTop === null) {
        currentTop = top;
      }

      if (top !== currentTop) {
        lines.push(currentChars.join(""));
        currentChars = [];
        currentTop = top;
      }

      currentChars.push(char);
    }

    if (currentChars.length) {
      lines.push(currentChars.join(""));
    }

    detectedTopLines = lines;
  }

  function killTween(tween) {
    tween?.scrollTrigger?.kill();
    tween?.kill();
  }

  onMount(() => {
    let tween;

    async function init() {
      if (!wrapperEl || !topMaskEl || !measureEl || !topMeasureEl) return;

      killTween(tween);

      await tick();
      buildBottomLines();
      buildTopLines();
      await tick();

      console.log(
        "bottom lines:",
        $state.snapshot(detectedBottomLines).map((line) => line.text),
      );
      console.log("top lines:", detectedTopLines);

      const lineMasks = topMaskEl.querySelectorAll(".top-mask-line");

      gsap.set(lineMasks, {
        clipPath: "inset(0 0 0 0)",
      });

      tween = gsap.to(lineMasks, {
        clipPath: "inset(0 0 0 100%)",
        ease: "none",
        stagger: 1,
        scrollTrigger: {
          trigger: wrapperEl,
          start,
          end,
          scrub: true,
          pin: true,
          pinSpacing: true,
          markers,
        },
      });

      ScrollTrigger.refresh();
    }

    init();
    window.addEventListener("resize", init);

    return () => {
      window.removeEventListener("resize", init);
      killTween(tween);
    };
  });
</script>

<div
  class="stack"
  bind:this={wrapperEl}
  style:--bottom-color={bottomColor}
  style:--top-color={topColor}
  style:--mask-color={maskColor}
  style:--max-width={maxWidth}
  style:--font-size={fontSize}
  style:--line-height={lineHeight}
  style:--font-weight={fontWeight}
  style:--font-family={fontFamily}
>
  <div class="line-rows" bind:this={topMaskEl}>
    <!-- {#each detectedBottomLines as bottomLine, i}
      <div class="line-row">
        <p class="bottom-line">{bottomLine}</p>

        <div class="top-mask-line">
          <p class="top-line">{detectedTopLines[i] ?? ""}</p>
        </div>
      </div>
    {/each} -->
    {#each detectedBottomLines as bottomLine, i}
      <div
        class="line-row"
        style:width={bottomLine.width ? `${bottomLine.width + 2}px` : "auto"}
      >
        <p class="bottom-line">{bottomLine.text}</p>

        <div class="top-mask-line">
          <p class="top-line">{detectedTopLines[i] ?? ""}</p>
        </div>
      </div>
    {/each}
  </div>

  <div class="measure" bind:this={measureEl} aria-hidden="true">
    <p class="measure-text">
      <!-- {#each bottomWords as word, i}
        <span class="measure-word" data-word={word}>
          {word}{i < bottomWords.length - 1 ? "\u00A0" : ""}
        </span>
      {/each} -->
        {#each bottomWords as word, i}
          <span class="measure-word" data-word={word}>
            {i < bottomWords.length - 1 ? `${word} ` : word}
          </span>
        {/each}
    </p>
  </div>
  <div class="measure-top" bind:this={topMeasureEl} aria-hidden="true">
    <p class="measure-top-text">
      {#each topChars as char}
        <span class="measure-top-char" data-char={char}>{char}</span>
      {/each}
    </p>
  </div>
</div>

<style>
  :host {
    display: block;
    width: 100%;
  }

  .stack {
    position: relative;
    display: block;
    width: 100%;
    max-width: var(--max-width);
    font-family: var(--font-family);
  }

  .line-rows {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .line-row {
    position: relative;
    display: block;
    /* width: fit-content; */
    max-width: 100%;
    overflow: hidden;
  }

  .bottom-line,
  .top-line {
    margin: 0;
    font-size: var(--font-size);
    line-height: var(--line-height);
    font-weight: var(--font-weight);
    letter-spacing: normal;
  }

  .bottom-line {
    color: var(--bottom-color);
    white-space: normal;
    display: inline-block;
    width: 100%;
  }

  .top-mask-line {
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: var(--mask-color);
  }

  .top-line {
    white-space: normal;
    color: var(--top-color);
    background: transparent;
    display: block;
    width: 100%;
  }

  .measure-top {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    inset: 0 auto auto 0;
    width: 100%;
    max-width: 100%;
    z-index: -1;
  }

  .measure-space {
    white-space: pre;
  }

  .measure-top-text {
    margin: 0;
    font-size: var(--font-size);
    line-height: var(--line-height);
    font-weight: var(--font-weight);
    letter-spacing: normal;
    font-family: var(--font-family);
    white-space: normal;
    width: 100%;
  }

  .measure-top-char {
    white-space: pre;
  }

  .measure {
    position: absolute;
    visibility: hidden;
    pointer-events: none;
    inset: 0 auto auto 0;
    width: 100%;
    max-width: 100%;
    z-index: -1;
  }

  .measure-text {
    margin: 0;
    font-size: var(--font-size);
    line-height: var(--line-height);
    font-weight: var(--font-weight);
    letter-spacing: normal;
    font-family: var(--font-family);
    white-space: normal;
    width: 100%;
  }

  .measure-word {
    white-space: pre;
  }
</style>
