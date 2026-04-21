<svelte:options
  customElement={{
    tag: "csis-translation-scramble",
    props: {
      topText: { attribute: "top-text", type: "String", reflect: true },
      bottomText: { attribute: "bottom-text", type: "String", reflect: true },
      height: { type: "Number", reflect: true },
      bgColor: { attribute: "bg-color", type: "String", reflect: true },
      textColor: { attribute: "text-color", type: "String", reflect: true },
      dudColor: { attribute: "dud-color", type: "String", reflect: true },
      label: { type: "String", reflect: true },
      labelColor: { attribute: "label-color", type: "String", reflect: true },
      triggerStart: {
        attribute: "trigger-start",
        type: "String",
        reflect: true,
      },
      speed: { type: "Number", reflect: true },
      revealDelay: { attribute: "reveal-delay", type: "Number", reflect: true },
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
    bgColor = "#0f0f10",
    textColor = "#f2ede3",
    dudColor = "#b44a3c",
    label = "signal decode",
    labelColor = "#8e3b32",
    triggerStart = "top 72%",
    speed = 1,
    revealDelay = 0,
  } = $props();

  let container;
  let textEl;
  let labelEl;

  class TextScramble {
    constructor(el, chars) {
      this.el = el;
      this.chars = chars;
      this.update = this.update.bind(this);
      this.frame = 0;
      this.queue = [];
      this.frameRequest = null;
      this.resolve = null;
    }

    setText(newText) {
      const oldText = this.el.textContent || "";
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => {
        this.resolve = resolve;
      });

      this.queue = [];

      for (let i = 0; i < length; i += 1) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        const start = Math.floor(Math.random() * 16 * speed);
        const end = start + Math.floor(Math.random() * 24 * speed) + 10;
        this.queue.push({ from, to, start, end, char: "" });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();

      return promise;
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    update() {
      let output = "";
      let complete = 0;

      for (let i = 0; i < this.queue.length; i += 1) {
        let { from, to, start, end, char } = this.queue[i];

        if (this.frame >= end) {
          complete += 1;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.randomChar();
            this.queue[i].char = char;
          }
          output += `<span class="dud">${char}</span>`;
        } else {
          output += from;
        }
      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {
        this.resolve?.();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame += 1;
      }
    }

    destroy() {
      cancelAnimationFrame(this.frameRequest);
    }
  }

  let fx;
  // let hasRun = false;
  let st;
  let delayCall;

  onMount(() => {
    fx = new TextScramble(
      textEl,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>\\/[]{}—=+*#%:;:",
    );

    textEl.textContent = topText;

    gsap.set(labelEl, {
      opacity: 0.95,
      y: 0,
    });

    st = ScrollTrigger.create({
      trigger: container,
      start: triggerStart,
      onEnter: () => {
        if (delayCall) {
          delayCall.kill();
          delayCall = null;
        }

        if (revealDelay > 0) {
          delayCall = gsap.delayedCall(revealDelay / 1000, () => {
            fx.setText(bottomText);
          });
        } else {
          fx.setText(bottomText);
        }
      },
      onLeaveBack: () => {
        if (delayCall) {
          delayCall.kill();
          delayCall = null;
        }
        fx.setText(topText);
      },
    });

    ScrollTrigger.refresh();

    return () => {
      delayCall?.kill();
      st?.kill();
      fx?.destroy();
    };
  });
</script>

<div
  class="wrapper"
  bind:this={container}
  style="
    --bg: {bgColor};
    --text: {textColor};
    --dud: {dudColor};
    --label: {labelColor};
    height: {height}px;
  "
>
  <div class="frame">
    <div class="label" bind:this={labelEl}>{label}</div>
    <div class="text-stage">
      <div class="text" bind:this={textEl}></div>
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
    color: var(--text);
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
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
      "Liberation Mono", "Courier New", monospace;
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--label);
    margin-bottom: 0.9rem;
  }

  .text-stage {
    min-height: 5.8rem;
    display: grid;
    place-items: center;
    text-align: center;
  }

  .text {
    width: min(680px, 100%);
    color: var(--text);
    font-size: clamp(1.15rem, 2vw, 1.85rem);
    line-height: 1.35;
    letter-spacing: 0.01em;
  }

  .text :global(.dud) {
    color: var(--dud);
    opacity: 0.85;
    text-shadow: 0 0 8px rgba(180, 74, 60, 0.28);
  }
</style>
