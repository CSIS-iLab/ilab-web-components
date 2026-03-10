<svelte:options
  customElement={{
    tag: "csis-scroll-highlight",
    props: {
      highlightStyle: {
        attribute: "highlight-style",
        type: "String",
        reflect: true,
      },
      highlightColor: {
        attribute: "highlight-color",
        type: "String",
        reflect: true,
      },
      textColor: {
        attribute: "text-color",
        type: "String",
        reflect: true,
      },
      activeTextColor: {
        attribute: "active-text-color",
        type: "String",
        reflect: true,
      },
      maxWidth: {
        attribute: "max-width",
        type: "String",
        reflect: true,
      },
      fontUrl: {
        attribute: "font-url",
        type: "String",
        reflect: true,
      },
      fontFamily: {
        attribute: "font-family",
        type: "String",
        reflect: true,
      },
      headingSize: {
        attribute: "heading-size",
        type: "String",
        reflect: true,
      },
      paragraphSize: {
        attribute: "paragraph-size",
        type: "String",
        reflect: true,
      },
      lineHeight: {
        attribute: "line-height",
        type: "String",
        reflect: true,
      },
      space: {
        attribute: "space",
        type: "String",
        reflect: true,
      },
      triggerStart: {
        attribute: "trigger-start",
        type: "String",
        reflect: true,
      },
      duration: {
        attribute: "duration",
        type: "String",
        reflect: true,
      },
    },
  }}
/>

<script>
  import { onMount, onDestroy } from "svelte";
  import { gsap } from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  export let highlightStyle = "background"; // background | half | underline
  export let highlightColor = "#ffe44d";
  export let textColor = "#24343a";
  export let activeTextColor = "#000";
  export let maxWidth = "80ch";

  export let fontUrl = "";
  export let fontFamily = '"Lora", Georgia, serif';
  export let headingSize = "clamp(2rem, 8vw, 4rem)";
  export let paragraphSize = "clamp(1.2rem, 4vw, 1.4rem)";
  export let lineHeight = "1.7";
  export let space = "2rem";

  // Similar spirit to the CodePen’s “-100px center” start point.
  export let triggerStart = "top 70%";
  export let duration = "1s";

  let rootEl;
  let fontLink;
  let triggers = [];
  let handleResize;

  gsap.registerPlugin(ScrollTrigger);

  function clearTriggers() {
    triggers.forEach((trigger) => trigger.kill());
    triggers = [];
  }

  function getAssignedRoots(slot) {
    if (!slot) return [];
    return slot.assignedElements({ flatten: true });
  }

  function getHighlightTargets(slot) {
    const roots = getAssignedRoots(slot);
    const targets = [];

    roots.forEach((root) => {
      if (
        root.matches?.("mark, .text-highlight, [data-highlight-text='true']")
      ) {
        targets.push(root);
      }

      targets.push(
        ...root.querySelectorAll(
          "mark, .text-highlight, [data-highlight-text='true']",
        ),
      );
    });

    return [...new Set(targets)];
  }

  function getTextNodesForBaseStyling(slot) {
    const roots = getAssignedRoots(slot);
    const nodes = [];

    roots.forEach((root) => {
      if (root.matches?.("p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote")) {
        nodes.push(root);
      }

      nodes.push(
        ...root.querySelectorAll(
          "p, h1, h2, h3, h4, h5, h6, ul, ol, li, blockquote",
        ),
      );
    });

    return [...new Set(nodes)];
  }

  function applyBaseContentStyles(slot) {
    const nodes = getTextNodesForBaseStyling(slot);

    nodes.forEach((node) => {
      node.style.color = textColor;
      node.style.fontFamily = fontFamily;
      node.style.maxWidth = maxWidth;

      if (node.matches("p, li, blockquote")) {
        node.style.fontSize = paragraphSize;
        node.style.lineHeight = lineHeight;
        node.style.margin = `${space} 0`;
      }

      if (node.matches("h1")) {
        node.style.fontSize = headingSize;
        node.style.lineHeight = "1.2";
        node.style.margin = `0 0 calc(${space} * 2) 0`;
      }

      if (node.matches("h2, h3, h4, h5, h6")) {
        node.style.lineHeight = "1.2";
        node.style.margin = `calc(${space} * 1.5) 0 ${space} 0`;
      }
    });
  }

  function getBackgroundImage() {
    if (highlightStyle === "half") {
      return `linear-gradient(
        transparent calc(100% - 0.5em),
        ${highlightColor} 0
      )`;
    }

    if (highlightStyle === "underline") {
      return `linear-gradient(
        transparent calc(100% - 0.15em),
        ${highlightColor} 0
      )`;
    }

    return `linear-gradient(${highlightColor}, ${highlightColor})`;
  }

  function setInactiveStyles(el) {
    el.style.backgroundRepeat = "no-repeat";
    el.style.backgroundImage = getBackgroundImage();
    el.style.backgroundSize = "0% 100%";
    el.style.transition = [
      `color calc(${duration} / 4) cubic-bezier(0.25, 1, 0.5, 1)`,
      `background-size ${duration} cubic-bezier(0.25, 1, 0.5, 1)`,
      `background-color calc(${duration} / 4) cubic-bezier(0.25, 1, 0.5, 1)`,
    ].join(", ");
    el.style.color = textColor;
    el.style.padding = "0";
    el.style.boxDecorationBreak = "clone";
    el.style.webkitBoxDecorationBreak = "clone";
  }

  function setActiveStyles(el) {
    el.style.backgroundSize = "100% 100%";
    el.style.color = activeTextColor;
  }

  function enhanceHighlights(slot) {
    clearTriggers();
    applyBaseContentStyles(slot);

    const highlights = getHighlightTargets(slot);

    highlights.forEach((el) => {
      setInactiveStyles(el);

      const trigger = ScrollTrigger.create({
        trigger: el,
        start: triggerStart,
        onEnter: () => setActiveStyles(el),
        onLeaveBack: () => setInactiveStyles(el),
      });

      triggers.push(trigger);
    });

    ScrollTrigger.refresh();
  }

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

  onMount(() => {
    setupFont();

    const slot = rootEl?.shadowRoot?.querySelector("slot");

    requestAnimationFrame(() => {
      enhanceHighlights(slot);
    });

    handleResize = () => enhanceHighlights(slot);
    window.addEventListener("resize", handleResize);
  });

  $: if (rootEl) {
    setupFont();

    const slot = rootEl?.shadowRoot?.querySelector("slot");

    requestAnimationFrame(() => {
      enhanceHighlights(slot);
    });
  }

  onDestroy(() => {
    clearTriggers();

    if (handleResize) {
      window.removeEventListener("resize", handleResize);
    }

    if (fontLink) {
      fontLink.remove();
    }
  });
</script>

<div
  bind:this={rootEl}
  class="scroll-highlight"
  style:--max-width={maxWidth}
  style:--text-color={textColor}
>
  <slot></slot>
</div>

<style>
  .scroll-highlight {
    display: block;
    width: 100%;
    color: var(--text-color);
  }
</style>
