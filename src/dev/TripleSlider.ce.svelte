<svelte:options
  customElement={{
    tag: "csis-triple-compare",
    props: {
      // images
      imgA: { attribute: "img-a", type: "String" },
      imgB: { attribute: "img-b", type: "String" },
      imgC: { attribute: "img-c", type: "String" },
      // labels
      labelA: { attribute: "label-a", type: "String" },
      labelB: { attribute: "label-b", type: "String" },
      labelC: { attribute: "label-c", type: "String" },
      labelFontSize: { attribute: "label-font-size", type: "String" },
      // show/hide top labels
      showLabels: { attribute: "show-labels", type: "Boolean" },
      // initial handle positions in percent (0–100)
      split1: { attribute: "split-1", type: "Number" },
      split2: { attribute: "split-2", type: "Number" },
      // optional aspect ratio like "16/9" or "4/3"
      aspect: { attribute: "aspect", type: "String" },
      // magnifier options
      magnifier: { attribute: "magnifier", type: "Boolean" },
      magnifierZoom: { attribute: "magnifier-zoom", type: "Number" },
      magnifierSize: { attribute: "magnifier-size", type: "Number" }, //px
      magnifierBorderColor: {
        attribute: "magnifier-border-color",
        type: "String",
      },
    },
  }}
/>

<script>
  import { onMount, onDestroy } from "svelte";

  let {
    // image defaults
    imgA = "",
    imgB = "",
    imgC = "",
    // label defaults
    labelA = "A",
    labelB = "B",
    labelC = "C",
    labelFontSize = "12px",
    // label default is off
    showLabels = false,
    // default splits
    split1 = 33.333,
    split2 = 66.666,
    // default aspect ratio
    aspect = "16/9",
    // magnifier default is off
    magnifier = false,
    // default magnifier settings
    magnifierZoom = 2,
    magnifierSize = 150,
    magnifierBorderColor = "#fff",
  } = $props();

  /* ------------------------------------------------------ */
  /*                     Magnifier State                    */
  /* ------------------------------------------------------ */
  // Whether the magnifier lens should be visible
  // (true when pointer is over the image, false otherwise)
  let magVisible = $state(false);

  // Current magnifier center position (pixels relative to the stage)
  let magX = $state(0);
  let magY = $state(0);

  /* ------------------------------------------------------ */
  /*                       Drag State                       */
  /* ------------------------------------------------------ */
  // Reference to the main image stage element
  // Used for measuring size and converting pointer coordinates
  let container;
  // Cached dimensions of the image stage (in pixels)
  // Used to scale and position the magnified image correctly
  let stageW = $state(0);
  let stageH = $state(0);

  // ResizeObserver instance for watching stage size changes
  // (stored so we can disconnect it on destroy)
  let ro;

  // Helper: radius of the magnifier lens (half its diameter)
  // Used to keep the lens fully inside the image bounds
  const magR = () => magnifierSize / 2;

  // Which handle is currently active (for drag + keyboard support)
  // "h1" = left handle, "h2" = right handle, null = none
  let activeHandle = $state(null);

  // Current drag behavior mode:
  // - "h1": dragging left handle
  // - "h2": dragging right handle
  // - "stack": handles are stacked and moving together
  // - null: no active drag
  let dragMode = $state(null);

  // When handles are stacked, this stores the percent position
  // where they met, so we know when the user has dragged far
  // enough to separate them again
  let stackAnchor = $state(null); // number | null (percentage)

  // Remembers which handle the user grabbed while stacked
  // Determines which direction breaks the stack
  let stackWhich = $state(null); // "h1" | "h2" | null

  /* ------------------------------------------------------ */
  /*                  Constants and Helpers                 */
  /* ------------------------------------------------------ */
  // Utility: clamp a value between min and max
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  // How close (in percent) the handles must be to count as "stacked"
  // Helps avoid jitter from tiny floating-point differences
  const STACK_EPSILON = 0.5;

  // Returns true if the two handles are currently stacked
  const isStacked = () => Math.abs(split2 - split1) <= STACK_EPSILON;

  // How far (in percent) the user must drag to separate stacked handles
  // Larger values make separation more intentional
  const STACK_BREAK = 1.0;

  /* ------------------------------------------------------ */
  /*             Measurement and Geometry Helpers            */
  /* ------------------------------------------------------ */
  function measureStage() {
    const rect = container?.getBoundingClientRect();
    if (!rect) return;
    stageW = rect.width;
    stageH = rect.height;
  }

  function pctFromClientX(clientX) {
    const rect = container?.getBoundingClientRect();
    if (!rect) return 0;
    const x = clamp(clientX - rect.left, 0, rect.width);
    return (x / rect.width) * 100;
  }

  function sortSplits() {
    // Allow overlap (no minimum gap), but prevent crossing.
    split1 = clamp(split1, 0, 100);
    split2 = clamp(split2, 0, 100);
  }

  /* ------------------------------------------------------ */
  /*                     Magnifier Logic                    */
  /* ------------------------------------------------------ */
  function updateMagnifierFromEvent(e) {
    if (!magnifier) return;
    if (!container) return;

    // Optional UX: hide magnifier while actively dragging handles
    if (dragMode) {
      magVisible = false;
      return;
    }

    const rect = container.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // clamp so lens stays fully inside stage
    const r = magR();
    x = clamp(x, r, rect.width - r);
    y = clamp(y, r, rect.height - r);

    magX = x;
    magY = y;
    magVisible = true;
  }

  function hideMagnifier() {
    magVisible = false;
  }

  /* ------------------------------------------------------ */
  /*                Pointer/Keyboard Handlers               */
  /* ------------------------------------------------------ */
  function onPointerDown(which, e) {
    activeHandle = which;

    e.currentTarget.focus();

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
    // Always track the magnifier when enabled
    updateMagnifierFromEvent(e);

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
    // show again after drag ends (next move will re-show)
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

  /* ------------------------------------------------------ */
  /*                     Lifecycle Hooks                    */
  /* ------------------------------------------------------ */
  onMount(() => {
    measureStage();
    ro = new ResizeObserver(measureStage);
    if (container) ro.observe(container);
    window.addEventListener("resize", measureStage);
  });

  onDestroy(() => {
    ro?.disconnect();
    window.removeEventListener("resize", measureStage);
  });

  /* ------------------------------------------------------ */
  /*                    Reactive Effects                    */
  /* ------------------------------------------------------ */
  $effect(() => {
    sortSplits();
  });
</script>

<div
  class="wrap"
  style={`--split1:${split1}%; --split2:${split2}%; --aspect:${aspect}; --label-font-size:${labelFontSize}`}
>
  <div
    class="stage"
    data-stacked={isStacked() ? "true" : "false"}
    bind:this={container}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    onpointerleave={() => {
      onPointerUp();
      hideMagnifier();
    }}
    onpointerenter={updateMagnifierFromEvent}
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
    {#if magnifier && magVisible}
      <div
        class="magnifier"
        style={`
      --mag-size:${magnifierSize}px;
      --mag-border:${magnifierBorderColor};
      --mag-left:${magX}px;
      --mag-top:${magY}px;
      --mag-img-w:${stageW * magnifierZoom}px;
      --mag-img-h:${stageH * magnifierZoom}px;
      --mag-off-x:${-(magX * magnifierZoom - magnifierSize / 2)}px;
      --mag-off-y:${-(magY * magnifierZoom - magnifierSize / 2)}px;
    `}
        aria-hidden="true"
      >
        <div class="magnifier__inner">
          {#if imgA}
            <img class="mag-layer mag-a" src={imgA} alt="" />
          {/if}

          {#if imgB}
            <img
              class="mag-layer mag-b"
              src={imgB}
              alt=""
              style={`clip-path: inset(0 0 0 var(--split1));`}
            />
          {/if}

          {#if imgC}
            <img
              class="mag-layer mag-c"
              src={imgC}
              alt=""
              style={`clip-path: inset(0 0 0 var(--split2));`}
            />
          {/if}
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
      600 var(--label-font-size, 12px) / 1 -apple-system,
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

  /* ------------------------------------------------------ */
  /*                        Magnifier                       */
  /* ------------------------------------------------------ */
  .magnifier {
    position: absolute;
    left: var(--mag-left);
    top: var(--mag-top);
    width: var(--mag-size);
    height: var(--mag-size);
    transform: translate(-50%, -50%);
    border: 3px solid var(--mag-border);
    border-radius: 50%;
    overflow: hidden;
    z-index: 20;
    pointer-events: none;
    background: rgba(0, 0, 0, 0.2);
  }

  .magnifier__inner {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .mag-layer {
    position: absolute;
    left: var(--mag-off-x);
    top: var(--mag-off-y);
    width: var(--mag-img-w);
    height: var(--mag-img-h);
    object-fit: cover;
    display: block;
    user-select: none;
  }
</style>
