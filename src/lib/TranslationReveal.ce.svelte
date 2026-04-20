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
      markers: { type: "Boolean", reflect: true }
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
    topColor = "#000000",
    maskColor = "#fff",
    start = "top 80%",
    end = "+=800",
    markers = false
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
  }

  .bottom,
  .top {
    margin: 0;
    font-size: 1.5rem;
    line-height: 1.2;
    white-space: nowrap;
  }

  .bottom {
    color: var(--bottom-color);
  }

  .top-mask {
    position: absolute;
    inset: 0;
    overflow: hidden;
    width: 100%;
  }

  .top {
    color: var(--top-color);
    background: var(--mask-color);
  }
</style>