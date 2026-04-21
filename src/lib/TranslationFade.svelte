<svelte:options
  customElement={{
    tag: "csis-translation-fade",
    props: {
      topText: { attribute: "top-text", type: "String", reflect: true },
      bottomText: { attribute: "bottom-text", type: "String", reflect: true },
      height: { type: "Number", reflect: true },
      bgColor: { attribute: "bg-color", type: "String", reflect: true },
      topColor: { attribute: "top-color", type: "String", reflect: true },
      bottomColor: { attribute: "bottom-color", type: "String", reflect: true },
      ghostColor: { attribute: "ghost-color", type: "String", reflect: true },
      label: { type: "String", reflect: true },
      labelColor: { attribute: "label-color", type: "String", reflect: true },
    },
  }}
/>

<script>
  import { onMount } from "svelte";
  import gsap from "gsap";
  import ScrollTrigger from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let {
    topText = "政策态势及中拉合作展望。",
    bottomText = "The Policy Trajectory and Prospects for China-Latin America Cooperation",
    height = 220,
    bgColor = "#111111",
    topColor = "#f5f1e8",
    bottomColor = "#f5f1e8",
    ghostColor = "rgba(245, 241, 232, 0.2)",
    label = "TRANSLATION",
    labelColor = "#b44a3c",
  } = $props();

  let container;
  let topEl;
  let bottomEl;
  let labelEl;

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.set(topEl, {
        opacity: 1,
        y: 0,
        scale: 1,
      });

      gsap.set(bottomEl, {
        opacity: 0,
        y: 20,
      });

      gsap.set(labelEl, {
        opacity: 0,
        y: 8,
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 88%",
          end: "+=340",
          scrub: true,
          markers: false,
        },
      });

      tl.to(
        topEl,
        {
          y: -18,
          opacity: 0.22,
          ease: "none",
        },
        0
      )
        .to(
          labelEl,
          {
            opacity: 1,
            y: 0,
            ease: "none",
          },
          0.15
        )
        .to(
          bottomEl,
          {
            opacity: 1,
            y: 0,
            ease: "none",
          },
          0.2
        );
    }, container);

    ScrollTrigger.refresh();

    return () => ctx.revert();
  });
</script>

<div
  class="wrapper"
  bind:this={container}
  style="
    --bg: {bgColor};
    --top: {topColor};
    --bottom: {bottomColor};
    --ghost: {ghostColor};
    --label: {labelColor};
    height: {height}px;
  "
>
  <div class="frame">
    <div class="label" bind:this={labelEl}>{label}</div>

    <div class="text-stage">
      <div class="top-text" bind:this={topEl}>{topText}</div>
      <div class="bottom-text" bind:this={bottomEl}>{bottomText}</div>
    </div>
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    background: var(--bg);
    color: var(--top);
    overflow: hidden;
    display: grid;
    place-items: center;
    padding: 1.5rem;
  }

  .frame {
    width: min(760px, 100%);
    border: 1px solid rgba(245, 241, 232, 0.18);
    padding: 1.25rem 1.25rem 1.5rem;
    position: relative;
    background:
      linear-gradient(
        to bottom,
        rgba(255, 255, 255, 0.03),
        rgba(255, 255, 255, 0)
      );
  }

  .label {
    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      "Liberation Mono",
      "Courier New",
      monospace;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--label);
    margin-bottom: 0.9rem;
    opacity: 0;
  }

  .text-stage {
    position: relative;
    min-height: 5.5rem;
    display: grid;
    place-items: center;
    text-align: center;
  }

  .top-text,
  .bottom-text {
    grid-area: 1 / 1;
    width: 100%;
    max-width: 680px;
    line-height: 1.35;
  }

  .top-text {
    color: var(--top);
    font-size: clamp(1.25rem, 2vw, 1.8rem);
    letter-spacing: 0.04em;
    z-index: 2;
    will-change: transform, opacity;
  }

  .bottom-text {
    padding-top: 20px;
    color: var(--bottom);
    font-size: clamp(1rem, 1.7vw, 1.3rem);
    z-index: 3;
    will-change: transform, opacity;
  }
</style>