<svelte:options
  customElement={{
    tag: "csis-progress-bar",
    props: {
      height: { type: "Number", reflect: true },
      max: { type: "Number", reflect: true },
      fillColor: { attribute: "fill-color", type: "String", reflect: true },
      trackColor: { attribute: "track-color", type: "String", reflect: true },
      zIndex: { attribute: "z-index", type: "Number", reflect: true },
    },
  }}
/>

<script>
  import { onMount } from "svelte";

  let {
    height = 8,
    max = 100,
    fillColor = "#000000",
    trackColor = "rgba(0, 0, 0, 0.15)",
    zIndex = 9999,
  } = $props();

  let progress = $state(0);

  let mountEl = null;
  let trackEl = null;
  let fillEl = null;

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function getScrollTop() {
    return (
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    );
  }

  function getScrollableHeight() {
    const doc = document.documentElement;
    const body = document.body;

    const scrollHeight = Math.max(
      doc.scrollHeight,
      doc.offsetHeight,
      body.scrollHeight,
      body.offsetHeight,
    );

    return Math.max(scrollHeight - window.innerHeight, 0);
  }

  function updateProgress() {
    const scrollTop = getScrollTop();
    const scrollableHeight = getScrollableHeight();

    if (scrollableHeight <= 0) {
      progress = 0;
    } else {
      const percent = (scrollTop / scrollableHeight) * max;
      progress = clamp(percent, 0, max);
    }

    updateBarUI();
  }

  function updateBarUI() {
    if (!mountEl || !trackEl || !fillEl) return;

    mountEl.style.position = "absolute";
    mountEl.style.left = "0";
    mountEl.style.bottom = "0";
    mountEl.style.width = "100%";
    mountEl.style.pointerEvents = "none";
    mountEl.style.zIndex = String(zIndex);

    trackEl.style.width = "100%";
    trackEl.style.height = `${height}px`;
    trackEl.style.background = trackColor;

    fillEl.style.height = "100%";
    fillEl.style.width = `${(progress / max) * 100}%`;
    fillEl.style.background = fillColor;
    fillEl.style.transition = "width 0.08s linear";
  }

  function getHeaderElement() {
    return (
      document.querySelector(".HeaderBarContainer") ||
      document.querySelector(".Story-Header") ||
      document.querySelector(".Levels--header")
    );
  }

  function ensureHeaderPositioning(headerEl) {
    const computed = window.getComputedStyle(headerEl);

    if (computed.position === "static") {
      headerEl.style.position = "relative";
    }
  }

  function createBar() {
    mountEl = document.createElement("div");
    mountEl.className = "csis-progress-bar-mounted";

    trackEl = document.createElement("div");
    trackEl.className = "csis-progress-bar-mounted__track";

    fillEl = document.createElement("div");
    fillEl.className = "csis-progress-bar-mounted__fill";

    trackEl.appendChild(fillEl);
    mountEl.appendChild(trackEl);
  }

  onMount(() => {
    const headerEl = getHeaderElement();

    if (!headerEl) {
      console.warn("csis-progress-bar: could not find Shorthand header");
      return;
    }

    ensureHeaderPositioning(headerEl);
    createBar();
    headerEl.appendChild(mountEl);

    updateProgress();

    const handleUpdate = () => {
      updateProgress();
    };

    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("load", handleUpdate);

    requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("load", handleUpdate);

      if (mountEl && mountEl.parentNode) {
        mountEl.parentNode.removeChild(mountEl);
      }
    };
  });
</script>

<style>
  :host {
    display: none;
  }
</style>