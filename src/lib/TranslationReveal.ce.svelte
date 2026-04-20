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
      fontFamily: { attribute: "font-family", type: "String", reflect: true }
    }
  }}
/>

<script>
  import { onMount } from "svelte";
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
    end = "+=800",
    markers = false,
    maxWidth = "800px",
    fontSize = "1.5rem",
    lineHeight = "1.2",
    fontWeight = "400",
    fontFamily = "inherit"
  } = $props();

  let wrapperEl;
  let topMaskEl;

  onMount(() => {
    if (!wrapperEl || !topMaskEl) return;

    gsap.set(topMaskEl, {
      clipPath: "inset(0 0 0 0)"
    });

    const tween = gsap.to(topMaskEl, {
      clipPath: "inset(0 0 0 100%)",
      ease: "none",
      scrollTrigger: {
        trigger: wrapperEl,
        start,
        end,
        scrub: true,
        markers
      }
    });

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
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
  <p class="bottom">{bottomText}</p>

  <div class="top-mask" bind:this={topMaskEl}>
    <p class="top">{topText}</p>
  </div>
</div>

<style>
  :host {
    display: block;
  }

  .stack {
    position: relative;
    display: inline-block;
    max-width: var(--max-width);
    font-family: var(--font-family);
  }

  .bottom,
  .top {
    margin: 0;
    font-size: var(--font-size);
    line-height: var(--line-height);
    font-weight: var(--font-weight);
    letter-spacing: normal;
    white-space: normal;
    display: block;
    width: 100%;
  }

  .bottom {
    color: var(--bottom-color);
  }

  .top-mask {
    position: absolute;
    inset: 0;
    overflow: hidden;
    width: 100%;
    background: var(--mask-color);
  }

  .top {
    color: var(--top-color);
    background: var(--mask-color);
  }
</style>