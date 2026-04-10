<svelte:options
  customElement={{
    tag: "csis-word-flip",
    props: {
      prefixText: {
        attribute: "prefix-text",
        type: "String",
        reflect: true,
      },
      items: {
        type: "String",
        reflect: true,
      },
      startIndex: {
        attribute: "start-index",
        type: "Number",
        reflect: true,
      },
      animate: {
        type: "String",
        reflect: true,
      },
      startHue: {
        attribute: "start-hue",
        type: "Number",
        reflect: true,
      },
      endHue: {
        attribute: "end-hue",
        type: "Number",
        reflect: true,
      },
      textColor: {
        attribute: "text-color",
        type: "String",
        reflect: true,
      },
      backgroundColor: {
        attribute: "background-color",
        type: "String",
        reflect: true,
      },
      fontFamily: {
        attribute: "font-family",
        type: "String",
        reflect: true,
      },
      fontUrl: {
        attribute: "font-url",
        type: "String",
        reflect: true,
      },
      lineHeight: {
        attribute: "line-height",
        type: "String",
        reflect: true,
      },
    },
  }}
/>

<script>
  import { onMount, tick } from "svelte";

  let rootEl;
  let listEl;
  let itemEls = [];
  let activeIndex = -1;
  let hasMounted = false;

  export let prefixText = "I build";
  export let items =
    '["products.","platforms.","web applications.","interfaces.","design systems."]';
  export let startIndex = 0;
  export let animate = "true";
  export let startHue = 25;
  export let endHue = 100;
  export let textColor = "#ffffff";
  export let backgroundColor = "#000000";
  export let fontFamily = "Inter, system-ui, sans-serif";
  export let fontUrl = "";
  export let lineHeight = "1.25";

  let parsedItems = [];

  function updateActiveItem() {
    if (!listEl) return;

    itemEls = Array.from(listEl.children);
    if (!itemEls.length) return;

    const viewportCenter = window.innerHeight / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    itemEls.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenter - viewportCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    activeIndex = closestIndex;
  }

  function parseItems(value) {
    if (Array.isArray(value)) {
      return value.filter(Boolean).map((item) => String(item));
    }

    if (typeof value !== "string") return [];

    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean).map((item) => String(item));
      }
    } catch {
      // Fall through to pipe/newline/comma parsing.
    }

    if (trimmed.includes("|")) {
      return trimmed
        .split("|")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (trimmed.includes("\n")) {
      return trimmed
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function loadFont(url) {
    if (!url || typeof document === "undefined") return;

    const existing = document.head.querySelector(
      `link[data-csis-word-flip-font="${url}"]`,
    );
    if (existing) return;

    const preconnect = document.createElement("link");
    preconnect.rel = "preconnect";
    preconnect.href = "https://fonts.googleapis.com";

    const preconnectStatic = document.createElement("link");
    preconnectStatic.rel = "preconnect";
    preconnectStatic.href = "https://fonts.gstatic.com";
    preconnectStatic.crossOrigin = "anonymous";

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.setAttribute("data-csis-word-flip-font", url);

    document.head.appendChild(preconnect);
    document.head.appendChild(preconnectStatic);
    document.head.appendChild(link);
  }

  async function syncListState() {
    await tick();

    if (!rootEl || !listEl || !parsedItems.length) return;

    const itemEls = Array.from(listEl.children);

    listEl.style.setProperty("--count", parsedItems.length);

    itemEls.forEach((item, index) => {
      item.style.setProperty("--i", index);
    });

    rootEl.style.setProperty("--start", String(startHue));
    rootEl.style.setProperty("--end", String(endHue));
  }

  $: parsedItems = parseItems(items);
  $: if (fontUrl) loadFont(fontUrl);
  $: if (hasMounted) syncListState();

  onMount(async () => {
    hasMounted = true;
    if (fontUrl) loadFont(fontUrl);
    await syncListState();

    updateActiveItem();

    const handleScroll = () => {
      if (animate === "true") updateActiveItem();
    };

    const handleResize = () => {
      if (animate === "true") updateActiveItem();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
  });

  $: srText = `${prefixText} ${parsedItems.join(" ")}`.trim();
</script>

<section
  class="word-flip"
  bind:this={rootEl}
  data-animate={animate === "true" ? "true" : "false"}
  style:--wf-text-color={textColor}
  style:--wf-background-color={backgroundColor}
  style:--wf-font-family={fontFamily}
  style:--wf-line-height={lineHeight}
>
  <div class="word-flip__inner">
    <h2 class="word-flip__prefix">
      <span aria-hidden="true">{prefixText}&nbsp;</span>
      <span class="sr-only">{srText}</span>
    </h2>

    <ul class="word-flip__list" bind:this={listEl}>
      {#each parsedItems as item, index}
        <li
          class:is-active={animate === "true" && index === activeIndex}
          class:is-before={animate === "true" && index === activeIndex - 1}
          class:is-after={animate === "true" && index === activeIndex + 1}
        >
          {item}
        </li>
      {/each}
    </ul>
  </div>
  <div class="word-flip__end-spacer" aria-hidden="true"></div>
</section>

<style>
  :host {
    display: block;
    color: var(--wf-text-color, #fff);
    background: var(--wf-background-color, #000);
    font-family: var(--wf-font-family, Inter, system-ui, sans-serif);

    --wf-lightness: 65%;
    --wf-base-chroma: 0.18;
    --wf-line-height: 1.25;
    --wf-max-width: 900px;
    --wf-component-height: 100vh;
    --start: 25;
    --end: 100;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .word-flip {
    width: 100%;
    max-width: none;
    margin: 0;
    background: var(--wf-background-color, #000);
    color: var(--wf-text-color, #fff);
  }

  .word-flip__inner {
    display: flex;
    justify-content: center;
    gap: 0.2em;
    line-height: var(--wf-line-height);
    padding-inline: 1rem;
  }

  .word-flip__prefix {
    position: sticky;
    top: calc(50vh - 0.5lh);
    margin: 0;
    align-self: flex-start;
    height: fit-content;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 500;
    white-space: nowrap;
    color: var(--wf-text-color, #fff);
  }

  .word-flip__list {
    list-style: none;
    margin: 0;
    padding-left: 0;
    padding-block: calc(50vh - 0.5lh);
    padding-bottom: 0;
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 500;
    --step: calc((var(--end) - var(--start)) / (var(--count) - 1));
  }

  .word-flip__end-spacer {
    height: calc(50vh - 0.5lh);
  }

  .word-flip__list li {
    margin: 0;
  }

  .word-flip__list li:not(:last-child) {
    color: hsl(
      calc(var(--start) * 1deg + (var(--step) * var(--i) * 1deg)) 85% 70%
    );
  }

  .word-flip__list li:last-child {
    color: var(--wf-text-color, #fff);
  }

  .word-flip[data-animate="true"] .word-flip__list li {
    opacity: 0.2;
    transition:
      opacity 180ms ease,
      filter 180ms ease;
  }

  .word-flip[data-animate="true"] .word-flip__list li.is-active {
    opacity: 1;
    filter: brightness(1.15);
  }

  .word-flip[data-animate="true"] .word-flip__list li.is-before,
  .word-flip[data-animate="true"] .word-flip__list li.is-after {
    opacity: 0.45;
  }

  @keyframes brighten {
    0% {
      opacity: var(--start-opacity, 0.2);
    }

    50% {
      opacity: 1;
      filter: brightness(var(--brightness, 1.2));
    }

    100% {
      opacity: var(--end-opacity, 0.2);
    }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (max-width: 700px) {
    .word-flip__inner {
      gap: 0.12em;
      padding-inline: 0.75rem;
    }

    .word-flip__prefix,
    .word-flip__list {
      font-size: clamp(1.8rem, 8vw, 3rem);
    }
  }
</style>
