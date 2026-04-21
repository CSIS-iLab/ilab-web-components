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
      ghostColor: { attribute: "ghost-color", type: "String", reflect: true },
      label: { type: "String", reflect: true },
      labelColor: { attribute: "label-color", type: "String", reflect: true },
      triggerStart: {
        attribute: "trigger-start",
        type: "String",
        reflect: true,
      },
      speed: { type: "Number", reflect: true },
      revealDelay: { attribute: "reveal-delay", type: "Number", reflect: true },
      fontUrl: { attribute: "font-url", type: "String", reflect: true },
      cjkFontFamily: {
        attribute: "cjk-font-family",
        type: "String",
        reflect: true,
      },
      latinFontFamily: {
        attribute: "latin-font-family",
        type: "String",
        reflect: true,
      },
      labelFontFamily: {
        attribute: "label-font-family",
        type: "String",
        reflect: true,
      },
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
    bgColor = "#1d1e22",
    textColor = "#a5e5d4",
    dudColor = "#42c3c8",
    ghostColor = "#d93da5",
    label = "signal decode",
    labelColor = "#8e3b32",
    triggerStart = "top 72%",
    speed = 1,
    revealDelay = 0,
    fontUrl = "",
    cjkFontFamily = '"Noto Sans SC", sans-serif',
    latinFontFamily = '"Space Mono", ui-monospace, monospace',
    labelFontFamily = '"Space Mono", ui-monospace, monospace',
  } = $props();

  let container;
  let textEl;
  let ghostLeftEl;
  let ghostRightEl;
  let labelEl;

  let fontLink;
  let fx;
  let st;
  let delayCall;

  function setupFont() {
    if (!fontUrl) return;

    if (fontLink) {
      fontLink.remove();
      fontLink = null;
    }

    fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href = fontUrl;
    document.head.appendChild(fontLink);
  }

  function applyCjkMode() {
    [textEl, ghostLeftEl, ghostRightEl].forEach((el) => {
      if (!el) return;
      el.style.fontFamily = cjkFontFamily;
      el.style.letterSpacing = "0.02em";
    });
  }

  function applyLatinMode() {
    [textEl, ghostLeftEl, ghostRightEl].forEach((el) => {
      if (!el) return;
      el.style.fontFamily = latinFontFamily;
      el.style.letterSpacing = "0.03em";
    });
  }

  function applyLabelFont() {
    if (!labelEl) return;
    labelEl.style.fontFamily = labelFontFamily;
  }

  class TextScramble {
    constructor(el, ghostLeftEl, ghostRightEl, chars) {
      this.el = el;
      this.ghostLeftEl = ghostLeftEl;
      this.ghostRightEl = ghostRightEl;
      this.chars = chars;
      this.update = this.update.bind(this);
      this.frame = 0;
      this.queue = [];
      this.frameRequest = null;
      this.resolve = null;
    }

    setText(newText, mode = "latin") {
      const oldText = this.el.textContent || "";
      const length = Math.max(oldText.length, newText.length);

      const promise = new Promise((resolve) => {
        this.resolve = resolve;
      });

      this.queue = [];

      if (mode === "cjk") {
        applyCjkMode();
      } else {
        applyLatinMode();
      }

      for (let i = 0; i < length; i += 1) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        const isAddedChar = i >= oldText.length;
        const baseStart = Math.floor(Math.random() * 16 * speed);
        const start = isAddedChar
          ? baseStart + Math.floor(10 * speed)
          : baseStart;
        const end = start + Math.floor(Math.random() * 24 * speed) + 10;
        this.queue.push({ from, to, start, end, char: "" });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.el.classList.add("is-glitching");
      this.ghostLeftEl.style.opacity = "1";
      this.ghostRightEl.style.opacity = "1";
      this.update();

      return promise;
    }

    randomChar() {
      return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    syncGhosts(text) {
      this.ghostLeftEl.textContent = text;
      this.ghostRightEl.textContent = text;
    }

    update() {
      let output = "";
      let plainText = "";
      let complete = 0;

      for (let i = 0; i < this.queue.length; i += 1) {
        let { from, to, start, end, char } = this.queue[i];

        if (this.frame >= end) {
          complete += 1;
          output += to;
          plainText += to;
        } else if (this.frame >= start) {
          if (to === " ") {
            output += " ";
            plainText += " ";
          } else {
            if (!char || Math.random() < 0.28) {
              char = this.randomChar();
              this.queue[i].char = char;
            }
            output += `<span class="dud">${char}</span>`;
            plainText += char;
          }
        } else {
          output += from || "";
          plainText += from || "";
        }
      }

      this.el.innerHTML = output;
      this.syncGhosts(plainText);

      if (complete === this.queue.length) {
        this.el.classList.remove("is-glitching");
        this.ghostLeftEl.style.opacity = "0";
        this.ghostRightEl.style.opacity = "0";
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

  onMount(() => {
    setupFont();
    applyLabelFont();

    fx = new TextScramble(
      textEl,
      ghostLeftEl,
      ghostRightEl,
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>\\/[]{}—=+*#%:;:",
    );

    textEl.textContent = topText;
    ghostLeftEl.textContent = topText;
    ghostRightEl.textContent = topText;
    applyCjkMode();

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
            fx.setText(bottomText, "latin");
          });
        } else {
          fx.setText(bottomText, "latin");
        }
      },
      onLeaveBack: () => {
        if (delayCall) {
          delayCall.kill();
          delayCall = null;
        }

        fx.setText(topText, "cjk");
      },
    });

    ScrollTrigger.refresh();

    return () => {
      delayCall?.kill();
      st?.kill();
      fx?.destroy();

      if (fontLink) {
        fontLink.remove();
        fontLink = null;
      }
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
    --ghost: {ghostColor};
    --label: {labelColor};
    height: {height}px;
  "
>
  <div class="frame">
    <div class="label" bind:this={labelEl}>{label}</div>

    <div class="text-stage">
      <div class="ghost ghost--left" bind:this={ghostLeftEl}></div>
      <div class="ghost ghost--right" bind:this={ghostRightEl}></div>
      <div class="text" bind:this={textEl}></div>
    </div>
  </div>
</div>

<style>
  :host {
    display: block;
    width: 100%;
  }

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
    font-size: 0.72rem;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--label);
    margin-bottom: 0.9rem;
  }

  .text-stage {
    position: relative;
    min-height: 5.8rem;
    display: grid;
    place-items: center;
    text-align: center;
  }

  .text,
  .ghost {
    width: min(680px, 100%);
    font-size: clamp(1.15rem, 2vw, 1.85rem);
    line-height: 1.35;
    grid-area: 1 / 1;
    white-space: pre-wrap;
  }

  .text {
    position: relative;
    color: var(--text);
    z-index: 3;
    text-shadow: 0 0 10px rgba(165, 229, 212, 0.22);
  }

  .ghost {
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms linear;
  }

  .text,
  .ghost {
    width: min(680px, 100%);
    font-size: clamp(1.15rem, 2vw, 1.85rem);
    line-height: 1.35;
    grid-area: 1 / 1;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .ghost--left {
    color: var(--ghost);
    transform: translateX(-3px);
    z-index: 1;
  }

  .ghost--right {
    color: var(--dud);
    transform: translateX(3px);
    z-index: 2;
  }

  .text :global(.dud) {
    color: var(--dud);
    opacity: 0.9;
    text-shadow: 0 0 8px rgba(66, 195, 200, 0.35);
    font-family: inherit;
  }
</style>
