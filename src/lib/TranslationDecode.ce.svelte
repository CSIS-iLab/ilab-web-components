<svelte:options
  customElement={{
    tag: "csis-translation-decode",
    props: {
      topText: { attribute: "top-text", type: "String", reflect: true },
      bottomText: { attribute: "bottom-text", type: "String", reflect: true },
      cipherText: { attribute: "cipher-text", type: "String", reflect: true },
      height: { type: "Number", reflect: true },
      bgColor: { attribute: "bg-color", type: "String", reflect: true },
      topColor: { attribute: "top-color", type: "String", reflect: true },
      cipherColor: { attribute: "cipher-color", type: "String", reflect: true },
      bottomColor: { attribute: "bottom-color", type: "String", reflect: true },
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
    cipherText = "TL-09 // CN-LATAM // PARTIAL DECODE",
    height = 260,
    bgColor = "#0f0f10",
    topColor = "#f2ede3",
    cipherColor = "#b44a3c",
    bottomColor = "#f2ede3",
    label = "signal decode",
    labelColor = "#8e3b32",
  } = $props();

  let container;
  let topEl;
  let cipherEl;
  let bottomEl;
  let labelEl;

  const SCRAMBLE_CHARS =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>[]{}—=+*#%:;";

  function scrambleToTarget(el, targetText, progress) {
    const clamped = Math.max(0, Math.min(1, progress));
    const revealCount = Math.floor(targetText.length * clamped);
    let out = "";

    for (let i = 0; i < targetText.length; i += 1) {
      if (targetText[i] === " ") {
        out += " ";
      } else if (i < revealCount) {
        out += targetText[i];
      } else {
        out +=
          SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }
    }

    el.textContent = out;
  }

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.set(topEl, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      });

      gsap.set(cipherEl, {
        opacity: 0,
        y: 0,
        filter: "blur(1px)",
      });

      gsap.set(bottomEl, {
        opacity: 0,
        y: 14,
        filter: "blur(5px)",
      });

      gsap.set(labelEl, {
        opacity: 0,
        y: 6,
      });

      scrambleToTarget(cipherEl, cipherText, 0);

      const st = ScrollTrigger.create({
        trigger: container,
        start: "top 60%",
        end: "+=220",
        scrub: true,
        markers: false,
        onUpdate: (self) => {
          const p = self.progress;

          const topProgress = Math.min(p / 0.55, 1);
          gsap.set(topEl, {
            opacity: gsap.utils.interpolate(1, 0.12, topProgress),
            y: gsap.utils.interpolate(0, -10, topProgress),
            filter: `blur(${gsap.utils.interpolate(0, 2, topProgress)}px)`,
          });

          const labelProgress = Math.min(Math.max((p - 0.1) / 0.15, 0), 1);
          gsap.set(labelEl, {
            opacity: labelProgress,
            y: gsap.utils.interpolate(6, 0, labelProgress),
          });

          const cipherIn = Math.min(Math.max((p - 0.18) / 0.18, 0), 1);
          const cipherOut = Math.min(Math.max((p - 0.58) / 0.16, 0), 1);
          const cipherOpacity = cipherIn * (1 - cipherOut);

          gsap.set(cipherEl, {
            opacity: cipherOpacity,
            y:
              gsap.utils.interpolate(6, 0, cipherIn) -
              gsap.utils.interpolate(0, 6, cipherOut),
            filter: `blur(${
              gsap.utils.interpolate(1, 0, cipherIn) +
              gsap.utils.interpolate(0, 1.5, cipherOut)
            }px)`,
          });

          if (cipherOpacity > 0.02) {
            const scrambleProgress = Math.min(
              Math.max((p - 0.22) / 0.32, 0),
              1,
            );
            scrambleToTarget(cipherEl, cipherText, scrambleProgress);
          }

          const bottomIn = Math.min(Math.max((p - 0.52) / 0.22, 0), 1);
          gsap.set(bottomEl, {
            opacity: bottomIn,
            y: gsap.utils.interpolate(14, 0, bottomIn),
            filter: `blur(${gsap.utils.interpolate(5, 0, bottomIn)}px)`,
          });
        },
      });

      return () => {
        st.kill();
      };
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
    --cipher: {cipherColor};
    --bottom: {bottomColor};
    --label: {labelColor};
    height: {height}px;
  "
>
  <div class="frame">
    <div class="label" bind:this={labelEl}>{label}</div>

    <div class="text-stage">
      <div class="top-text" bind:this={topEl}>{topText}</div>
      <div class="cipher-text" bind:this={cipherEl}>{cipherText}</div>
      <div class="bottom-text" bind:this={bottomEl}>{bottomText}</div>
    </div>
  </div>
</div>

<style>
  .wrapper {
    position: relative;
    background: var(--bg);
    overflow: hidden;
    display: grid;
    place-items: center;
    padding: 1.5rem;
    color: var(--top);
  }

  .frame {
    width: min(760px, 100%);
    border: 1px solid rgba(242, 237, 227, 0.16);
    padding: 1.2rem 1.25rem 1.5rem;
    position: relative;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.025),
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
    min-height: 8.5rem;
    text-align: center;
  }

  .top-text,
  .cipher-text,
  .bottom-text {
    position: absolute;
    left: 50%;
    width: min(680px, 100%);
    transform: translateX(-50%);
    line-height: 1.35;
    will-change: transform, opacity, filter;
  }

  .top-text {
    top: 0.2rem;
    color: var(--top);
    font-size: clamp(1.25rem, 2vw, 1.8rem);
    letter-spacing: 0.04em;
    z-index: 2;
  }

  .cipher-text {
    top: 2.9rem;
    color: var(--cipher);
    font-family:
      ui-monospace,
      SFMono-Regular,
      Menlo,
      Monaco,
      Consolas,
      "Liberation Mono",
      "Courier New",
      monospace;
    font-size: clamp(0.78rem, 1vw, 0.9rem);
    letter-spacing: 0.14em;
    text-shadow: 0 0 10px rgba(180, 74, 60, 0.3);
    text-transform: uppercase;
    z-index: 3;
    white-space: nowrap;
  }

  .bottom-text {
    top: 5.2rem;
    color: var(--bottom);
    font-size: clamp(1rem, 1.7vw, 1.3rem);
    z-index: 4;
  }
</style>