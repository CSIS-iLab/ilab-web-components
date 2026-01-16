<svelte:options
  customElement={{
    tag: "csis-triple-compare",
    props: {
      imgA: { attribute: "img-a", type: "String" },
      imgB: { attribute: "img-b", type: "String" },
      imgC: { attribute: "img-c", type: "String" },
      labelA: { attribute: "label-a", type: "String" },
      labelB: { attribute: "label-b", type: "String" },
      labelC: { attribute: "label-c", type: "String" },
      // initial handle positions in percent (0–100)
      split1: { attribute: "split-1", type: "Number" },
      split2: { attribute: "split-2", type: "Number" },
      // show/hide top labels
      showLabels: { attribute: "show-labels", type: "Boolean" },
      // optional aspect ratio like "16/9" or "4/3"
      aspect: { attribute: "aspect", type: "String" },
    },
  }}
/>

<script>
  let {
    imgA = "",
    imgB = "",
    imgC = "",
    labelA = "A",
    labelB = "B",
    labelC = "C",
    split1 = 33.333,
    split2 = 66.666,
    showLabels = true,
    aspect = "16/9",
  } = $props();

  let container;
  let activeHandle = $state(null); // "h1" | "h2" | null

  let dragMode = $state(null); // "h1" | "h2" | "stack" | nul

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const STACK_EPSILON = 0.5; // percent; tweak if you want
  const isStacked = () => Math.abs(split2 - split1) <= STACK_EPSILON;

  const STACK_BREAK = 1.0; // percent needed to "pull apart" when stacked

  let stackAnchor = $state(null); // number | null (pct)
  let stackWhich = $state(null); // "h1" | "h2" | null

  function sortSplits() {
    // Allow overlap (no minimum gap), but prevent crossing.
    split1 = clamp(split1, 0, 100);
    split2 = clamp(split2, 0, 100);
  }

  function pctFromClientX(clientX) {
    const rect = container?.getBoundingClientRect();
    if (!rect) return 0;
    const x = clamp(clientX - rect.left, 0, rect.width);
    return (x / rect.width) * 100;
  }

  function onPointerDown(which, e) {
    activeHandle = which;

    const stacked = isStacked();

    if (stacked) {
      dragMode = "stack";
      stackAnchor = (split1 + split2) / 2; // where they’re stacked
      stackWhich = which; // remember which knob they grabbed
    } else {
      dragMode = which;
      stackAnchor = null;
      stackWhich = null;
    }

    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e) {
    if (!dragMode) return;

    const p = pctFromClientX(e.clientX);

    if (dragMode === "stack") {
      // If they pull outward far enough, break the stack.
      // - Grabbed h1: pulling LEFT separates
      // - Grabbed h2: pulling RIGHT separates
      if (
        stackAnchor != null &&
        stackWhich === "h1" &&
        p < stackAnchor - STACK_BREAK
      ) {
        dragMode = "h1";
        split2 = stackAnchor; // keep the other handle at the anchor
        split1 = p;
        sortSplits();
        return;
      }

      if (
        stackAnchor != null &&
        stackWhich === "h2" &&
        p > stackAnchor + STACK_BREAK
      ) {
        dragMode = "h2";
        split1 = stackAnchor;
        split2 = p;
        sortSplits();
        return;
      }

      // Otherwise, keep dragging both together
      split1 = p;
      split2 = p;
      sortSplits();
      return;
    }

    if (dragMode === "h1") {
      if (p >= split2) {
        split1 = p;
        split2 = p; // carry
      } else {
        split1 = p;
      }
    }

    if (dragMode === "h2") {
      if (p <= split1) {
        split2 = p;
        split1 = p; // carry
      } else {
        split2 = p;
      }
    }

    sortSplits();
  }

  function onPointerUp() {
    activeHandle = null;
    dragMode = null;
    stackAnchor = null;
    stackWhich = null;
  }

  function onKeyDown(which, e) {
    const step = e.shiftKey ? 5 : 1; // shift = bigger move
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      if (which === "h1") split1 -= step;
      if (which === "h2") split2 -= step;
      activeHandle = which;
      sortSplits();
      e.preventDefault();
    }
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      if (which === "h1") split1 += step;
      if (which === "h2") split2 += step;
      activeHandle = which;
      sortSplits();
      e.preventDefault();
    }
    if (e.key === "Home") {
      if (which === "h1") split1 = 0;
      if (which === "h2") split2 = 0;
      activeHandle = which;
      sortSplits();
      e.preventDefault();
    }
    if (e.key === "End") {
      if (which === "h1") split1 = 100;
      if (which === "h2") split2 = 100;
      activeHandle = which;
      sortSplits();
      e.preventDefault();
    }
    const stacked = isStacked();

    if (stacked) {
      if (which === "h1") split2 = split1;
      if (which === "h2") split1 = split2;
    } else {
      // prevent crossing: if you cross, snap together (stack)
      if (split1 > split2) split1 = split2;
    }
  }

  $effect(() => {
    sortSplits();
  });
</script>

<div
  class="wrap"
  style={`--split1:${split1}%; --split2:${split2}%; --aspect:${aspect};`}
>
  <div
    class="stage"
    data-stacked={isStacked() ? "true" : "false"}
    bind:this={container}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onpointerleave={onPointerUp}
  >
    <!-- Base layer -->
    <div class="layer layer-a">
      {#if imgA}
        <img src={imgA} alt={labelA} />
      {/if}
    </div>

    <!-- Middle layer: visible from split1 to 100 -->
    <div class="layer layer-b" style={`clip-path: inset(0 0 0 var(--split1));`}>
      {#if imgB}
        <img src={imgB} alt={labelB} />
      {/if}
    </div>

    <!-- Top layer: visible from split2 to 100 -->
    <div class="layer layer-c" style={`clip-path: inset(0 0 0 var(--split2));`}>
      {#if imgC}
        <img src={imgC} alt={labelC} />
      {/if}
    </div>

    {#if showLabels}
      <div class="labels" aria-hidden="true">
        <div class="label label-a" style={`width: var(--split1);`}>
          {labelA}
        </div>
        <div
          class="label label-b"
          style={`left: var(--split1); width: calc(var(--split2) - var(--split1));`}
        >
          {labelB}
        </div>
        <div
          class="label label-c"
          style={`left: var(--split2); width: calc(100% - var(--split2));`}
        >
          {labelC}
        </div>
      </div>
    {/if}
    <!-- {#if isStacked()}
      <button
        class="stack-catcher"
        style={`left: var(--split1);`}
        aria-label="Drag stacked divider"
        onpointerdown={onStackPointerDown}
        type="button"
      ></button>
    {/if} -->

    <!-- Handle 1 -->
    <button
      class="handle handle--h1"
      style={`left: var(--split1); --knob-y: ${isStacked() ? "-28px" : "0px"};`}
      aria-label={`Adjust split between ${labelA} and ${labelB}`}
      onpointerdown={(e) => onPointerDown("h1", e)}
      onkeydown={(e) => onKeyDown("h1", e)}
      type="button"
    >
      <span class="bar" aria-hidden="true"></span>
      <span class="knob" aria-hidden="true"></span>
    </button>

    <!-- Handle 2 -->
    <button
      class="handle handle--h2"
      style={`left: var(--split2); --knob-y: ${isStacked() ? "28px" : "0px"};`}
      aria-label={`Adjust split between ${labelB} and ${labelC}`}
      onpointerdown={(e) => onPointerDown("h2", e)}
      onkeydown={(e) => onKeyDown("h2", e)}
      type="button"
    >
      <span class="bar" aria-hidden="true"></span>
      <span class="knob" aria-hidden="true"></span>
    </button>
  </div>
</div>

<style>
  :host {
    display: block;
    width: 100%;
  }

  .wrap {
    width: 100%;
  }

  /* Maintain a clean aspect ratio so images align */
  .stage {
    position: relative;
    width: 100%;
    aspect-ratio: var(--aspect);
    background: #111;
    overflow: hidden;
    border-radius: 12px;
    user-select: none;
    touch-action: none; /* we’re doing our own pointer handling */
  }

  /* when stacked, nudge the remaining bar sideways so it doesn’t sit under the top knob */
  .stage[data-stacked="true"] .handle--h2 .bar {
    transform: translateX(calc(-50% + 5px));
  }

  .layer {
    position: absolute;
    inset: 0;
  }

  .layer img {
    width: 100%;
    height: 100%;
    object-fit: cover; /* change to contain if you prefer */
    display: block;
  }

  .labels {
    position: absolute;
    top: 10px;
    left: 10px;
    right: 10px;
    height: 34px;
    display: block;
    pointer-events: none;
    z-index: 5;
  }

  .label {
    position: absolute;
    top: 0;
    height: 34px;
    display: flex;
    align-items: center;
    padding: 0 10px;
    font:
      600 12px/1 system-ui,
      -apple-system,
      Segoe UI,
      Roboto,
      Helvetica,
      Arial,
      sans-serif;
    letter-spacing: 0.02em;
    color: #fff;
    background: rgba(0, 0, 0, 0.55);
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-radius: 999px;
    backdrop-filter: blur(6px);
    max-width: 60%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Handles */
  .handle {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    height: 100%;
    width: 44px;
    background: transparent;
    border: 0;
    padding: 0;
    z-index: 10;
    cursor: ew-resize;
  }

  .handle:focus-visible .knob {
    outline: 2px solid #fff;
    outline-offset: 2px;
  }

  .bar {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4);
  }

  .knob {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, calc(-50% + var(--knob-y, 0px)));
    transition: transform 120ms ease;
    width: 28px;
    height: 40px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(6px);
  }

  .knob::before,
  .knob::after {
    content: "";
    position: absolute;
    top: 50%;
    width: 2px;
    height: 14px;
    background: rgba(255, 255, 255, 0.9);
    transform: translateY(-50%);
    border-radius: 2px;
  }
  .knob::before {
    left: 11px;
  }
  .knob::after {
    right: 11px;
  }

  /* .stack-catcher {
    position: absolute;
    top: 0;
    transform: translateX(-50%);
    height: 100%;
    width: 90px;
    background: transparent;
    border: 0;
    padding: 0;
    z-index: 9; 
    cursor: ew-resize;
  } */
</style>
