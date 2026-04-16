<svelte:options
  customElement={{
    tag: "csis-progress-bar",
    props: {
      height: { type: "Number", reflect: true },
      max: { type: "Number", reflect: true },
      fillColor: { attribute: "fill-color", type: "String", reflect: true },
      trackColor: { attribute: "track-color", type: "String", reflect: true },
      zIndex: { attribute: "z-index", type: "Number", reflect: true },
      offsetTop: { attribute: "offset-top", type: "Number", reflect: true },
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
    offsetTop = 0,
  } = $props();

  let progress = $state(0);

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
      body.offsetHeight
    );

    return Math.max(scrollHeight - window.innerHeight, 0);
  }

  function updateProgress() {
    const scrollTop = getScrollTop();
    const scrollableHeight = getScrollableHeight();

    if (scrollableHeight <= 0) {
      progress = 0;
      return;
    }

    const percent = (scrollTop / scrollableHeight) * max;
    progress = clamp(percent, 0, max);
  }

  onMount(() => {
    updateProgress();

    const handleUpdate = () => {
      updateProgress();
    };

    window.addEventListener("scroll", handleUpdate, { passive: true });
    window.addEventListener("resize", handleUpdate);
    window.addEventListener("load", handleUpdate);

    // extra update in case layout shifts after mount
    requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("load", handleUpdate);
    };
  });
</script>

<div
  class="progress-bar"
  role="progressbar"
  aria-valuemin="0"
  aria-valuemax={max}
  aria-valuenow={Math.round(progress)}
  style={`
    --progress-height: ${height}px;
    --progress-fill-color: ${fillColor};
    --progress-track-color: ${trackColor};
    --progress-z-index: ${zIndex};
    --progress-offset-top: ${offsetTop}px;
    --progress-value: ${(progress / max) * 100}%;
  `}
>
  <div class="progress-bar__track">
    <div class="progress-bar__fill"></div>
  </div>
</div>

<style>
  :host {
    display: block;
    pointer-events: none;
  }

  .progress-bar {
    position: fixed;
    top: var(--progress-offset-top);    
    left: 0;
    width: 100%;
    z-index: var(--progress-z-index);
  }

  .progress-bar__track {
    width: 100%;
    height: var(--progress-height);
    background: var(--progress-track-color);
  }

  .progress-bar__fill {
    width: var(--progress-value);
    height: 100%;
    background: var(--progress-fill-color);
    transition: width 0.08s linear;
  }
</style>