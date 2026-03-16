<svelte:options
  customElement={{
    tag: "csis-scroll-highlight",
    shadow: "none",
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
        type: "Number",
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
      fontSize: {
        attribute: "paragraph-size",
        type: "String",
        reflect: true,
      },
      lineHeight: {
        attribute: "line-height",
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
  export let maxWidth = "800";

  export let fontUrl = "";
  export let fontFamily = '"Lora", Georgia, serif';
  export let fontSize = "1.25rem";
  export let lineHeight = "1.7";

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

  function getSlotElement() {
    return rootEl?.getRootNode()?.querySelector("slot") ?? null;
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
      if (root.matches?.("p, ul, ol, li, blockquote")) {
        nodes.push(root);
      }

      nodes.push(...root.querySelectorAll("p, ul, ol, li, blockquote"));
    });

    return [...new Set(nodes)];
  }

  function applyBaseContentStyles(slot) {
    const nodes = getTextNodesForBaseStyling(slot);

    nodes.forEach((node) => {
      node.style.color = textColor;
      node.style.fontFamily = fontFamily;
      node.style.fontSize = fontSize;
      node.style.lineHeight = lineHeight;
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
    el.style.backgroundColor = "transparent";
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

  function toPx(value) {
    if (value === null || value === undefined || value === "") return "";
    return typeof value === "number" ? `${value}px` : value;
  }

  onMount(() => {
    setupFont();

    const slot = getSlotElement();

    requestAnimationFrame(() => {
      enhanceHighlights(slot);
    });

    handleResize = () => {
      const slot = getSlotElement();
      enhanceHighlights(slot);
    };

    window.addEventListener("resize", handleResize);
  });

  $: if (rootEl) {
    setupFont();

    const slot = getSlotElement();

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
  style:--max-width={toPx(maxWidth)}
  style:--text-color={textColor}
>
  <slot></slot>
</div>

<style>
  :host {
    display: block;
    width: 100%;
  }

  .scroll-highlight {
    display: block;
    width: 100%;
    max-width: var(--max-width);
    margin: 0 auto;
    color: var(--text-color);
  }
</style>
