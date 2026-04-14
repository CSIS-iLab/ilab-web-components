<svelte:options
  customElement={{
    tag: "csis-satellite-snapshot",
    props: {
      dataURL: { attribute: "data-url", type: "String" },
      btnColor: { attribute: "btn-color", type: "String" },
      btnBgColor: { attribute: "btn-bg-color", type: "String" },
      btnBorderColor: { attribute: "btn-border-color", type: "String" },
      btnBorderThickness: { attribute: "btn-border-thickness", type: "String" },
      btnSVGColor: { attribute: "btn-svg-color", type: "String" },
      btnHoverColor: { attribute: "btn-hover-color", type: "String" },
      btnBgHoverColor: { attribute: "btn-bg-hover-color", type: "String" },
      tooltipFontSize: { attribute: "tooltip-font-size", type: "String" },
      timelineLineColor: { attribute: "timeline-line-color", type: "String" },
      timelineCircleSize: {
        attribute: "timeline-circle-size",
        type: "String",
      },
      timelineCircleColor: {
        attribute: "timeline-circle-color",
        type: "String",
      },
      timelineCircleBorderColor: {
        attribute: "timeline-circle-border-color",
        type: "String",
      },
      timelineCircleSelectedBorderColor: {
        attribute: "timeline-circle-selected-border-color",
        type: "String",
      },
      timelineYearColor: { attribute: "timeline-year-color", type: "String" },
      boxFontUrl: { attribute: "box-font-url", type: "String" },
      boxFontFamily: { attribute: "box-font-family", type: "String" },
      titleColor: { attribute: "title-color", type: "String" },
      titleAlignment: { attribute: "title-alignment", type: "String" },
      titleFontSize: { attribute: "title-font-size", type: "String" },
      dateFontColor: { attribute: "date-font-color", type: "String" },
      dateFontSize: { attribute: "date-font-size", type: "String" },
      dateAlignment: { attribute: "date-alignment", type: "String" },
      descriptionFontColor: {
        attribute: "description-font-color",
        type: "String",
      },
      descriptionAlignment: {
        attribute: "description-alignment",
        type: "String",
      },
      descriptionFontSize: {
        attribute: "description-font-size",
        type: "String",
      },
      textBoxBgColor: {
        attribute: "text-box-background-color",
        type: "String",
      },
      textBoxBorderThickness: {
        attribute: "text-box-border-thickness",
        type: "String",
      },
      textBoxBorderColor: {
        attribute: "text-box-border-color",
        type: "String",
      },
      textBoxBorderRadius: {
        attribute: "text-box-border-radius",
        type: "String",
      },
    },
  }}
/>

<script>
  import { onMount, tick } from "svelte"
  import { getData } from "./api/data"

  let data = $state([])
  let selectedIndex = $state(0)
  let hoveredIndex = $state(null)

  let timelineScroller = $state()
  let timelineShell = $state()
  let scrollLeft = $state(0)

  let {
    dataURL = "",
    btnColor = "#ccc",
    btnBgColor = "#fff",
    btnBorderColor = "#DD3D3D",
    btnBorderThickness = "1px",
    btnSVGColor = "#DD3D3D",
    btnHoverColor = "hsl(0 0% 50% / 0.05)",
    btnBgHoverColor = "white",
    tooltipFontSize = ".8rem",
    timelineLineColor = "#d9d9d9",
    timelineCircleSize = "1rem",
    timelineCircleColor = "#d9d9d9",
    timelineCircleBorderColor = "#d9d9d9",
    timelineCircleSelectedBorderColor = "#d9d9d9",
    timelineYearColor = "#fff",
    boxFontUrl = "",
    boxFontFamily = "'IBM Plex Sans', system-ui, sans-serif",
    titleColor = "#000",
    titleAlignment = "left",
    titleFontSize = "1.5rem",
    dateFontColor = "#000",
    dateFontSize = "1rem",
    dateAlignment = "left",
    descriptionFontColor = "#000",
    descriptionFontSize = "1rem",
    descriptionAlignment = "left",
    textBoxBgColor = "white",
    textBoxBorderThickness = "2px",
    textBoxBorderColor = "red",
    textBoxBorderRadius = "15px",
  } = $props()

  let container = $state()

  const EDGE_PAD = 56
  const MIN_GAP_PX = 56
  const PX_PER_DAY = 2.25
  const TOOLTIP_EDGE_PAD = 72

  onMount(async () => {
    if (!dataURL) return

    try {
      data = await getData(dataURL)
      selectedIndex = data.length ? data.length - 1 : 0

      await tick()

      requestAnimationFrame(() => {
        scrollToIndex(selectedIndex, "auto")

        requestAnimationFrame(() => {
          syncScrollLeft()
        })
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  })
  /* -------------------- font loading -------------------- */
  onMount(() => {
    if (!boxFontUrl) return;

    const existing = document.querySelector(
      `link[data-csis-font="${boxFontUrl}"]`
    );
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = boxFontUrl;
    link.dataset.csisFont = boxFontUrl;
    document.head.appendChild(link);
  });

  const selectedItem = $derived(data[selectedIndex])

  const timelineItems = $derived.by(() => {
    if (!data.length) return []

    let x = 0

    return data.map((item, index) => {
      if (index === 0) {
        return { ...item, x }
      }

      const prev = data[index - 1]
      const gapDays = Math.max(
        1,
        Math.round((item.timestamp - prev.timestamp) / 86400000),
      )
      const gapPx = Math.max(MIN_GAP_PX, gapDays * PX_PER_DAY)

      x += gapPx

      return { ...item, x }
    })
  })

  const railWidth = $derived.by(() => {
    if (!timelineItems.length) return EDGE_PAD * 2
    return timelineItems[timelineItems.length - 1].x + EDGE_PAD * 2
  })

  const activeTooltipIndex = $derived(hoveredIndex ?? selectedIndex)

  const tooltipLeft = $derived.by(() => {
    const item = timelineItems[activeTooltipIndex]
    if (!item || !timelineShell) return TOOLTIP_EDGE_PAD

    const rawLeft = EDGE_PAD + item.x - scrollLeft
    const shellWidth = timelineShell.clientWidth || 0

    const min = TOOLTIP_EDGE_PAD
    const max = Math.max(min, shellWidth - TOOLTIP_EDGE_PAD)

    return Math.max(min, Math.min(rawLeft, max))
  })

  function syncScrollLeft() {
    scrollLeft = timelineScroller?.scrollLeft ?? 0
  }

  function selectItem(index) {
    selectedIndex = index
    scrollToIndex(index)
  }

  function prev() {
    if (selectedIndex > 0) {
      selectedIndex -= 1
      scrollToIndex(selectedIndex)
    }
  }

  function next() {
    if (selectedIndex < data.length - 1) {
      selectedIndex += 1
      scrollToIndex(selectedIndex)
    }
  }

  function scrollToIndex(index, behavior = "smooth") {
    const item = timelineItems[index]
    if (!item || !timelineScroller) return

    const target = EDGE_PAD + item.x - timelineScroller.clientWidth / 2

    timelineScroller.scrollTo({
      left: Math.max(0, target),
      behavior,
    })

    requestAnimationFrame(() => {
      syncScrollLeft()
    })
  }

  function handleEnter(index) {
    hoveredIndex = index
  }

  function handleLeave() {
    hoveredIndex = null
  }

  function handleScroll() {
    syncScrollLeft()
  }
</script>

{#if selectedItem}
  <section
    class="snapshot-timeline"
    style={`
      --btn-color: ${btnColor};
      --btn-bg-color: ${btnBgColor};
      --btn-border-color: ${btnBorderColor};
      --btn-border-thickness: ${btnBorderThickness};
      --btn-svg-color: ${btnSVGColor};
      --btn-hover-color: ${btnHoverColor};
      --btn-bg-hover-color: ${btnBgHoverColor};
      --tooltip-font-size: ${tooltipFontSize};
      --timeline-line-color: ${timelineLineColor};
      --timeline-circle-size: ${timelineCircleSize};
      --timeline-circle-color: ${timelineCircleColor};
      --timeline-circle-border-color: ${timelineCircleBorderColor};
      --timeline-circle-selected-border-color: ${timelineCircleSelectedBorderColor};
      --timeline-year-color: ${timelineYearColor};
      --box-font-family: ${boxFontFamily};
      --title-color: ${titleColor};
      --title-alignment: ${titleAlignment};
      --title-font-size: ${titleFontSize};
      --date-font-size: ${dateFontSize};
      --date-font-color: ${dateFontColor};
      --date-alignment: ${dateAlignment};
      --description-font-color: ${descriptionFontColor};
      --description-font-size: ${descriptionFontSize};
      --description-alignment: ${descriptionAlignment};
      --text-box-bg-color:  ${textBoxBgColor};
      --text-box-border-thickness: ${textBoxBorderThickness};
      --text-box-border-color: ${textBoxBorderColor};
      --text-box-border-radius: ${textBoxBorderRadius};
    `}
  >
    <div class="snapshot-media">
      <figure>
        <img src={selectedItem.imageLink} alt={selectedItem.imageAlt} />
      </figure>
    </div>

    <div class="timeline-bar" aria-label="Timeline navigation">
      <button
        class="nav-btn left"
        type="button"
        onclick={prev}
        disabled={selectedIndex === 0}
        aria-label="Previous item"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          ><path
            d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"
          /></svg
        >
        Prev
      </button>

      <div class="timeline-shell" bind:this={timelineShell}>
        <div class="timeline-tooltip" style={`left: ${tooltipLeft}px;`}>
          {timelineItems[activeTooltipIndex]?.dateText}
        </div>

        <div
          class="timeline-track-wrap"
          bind:this={timelineScroller}
          onscroll={handleScroll}
        >
          <div class="timeline-rail" style={`width: ${railWidth}px;`}>
            <div
              class="timeline-line"
              style={`left: ${EDGE_PAD}px; width: ${Math.max(0, railWidth - EDGE_PAD * 2)}px;`}
            ></div>

            <ol class="timeline-points">
              {#each timelineItems as item, index}
                <li
                  class="timeline-point"
                  class:selected={index === selectedIndex}
                  style={`left: ${EDGE_PAD + item.x}px;`}
                  data-index={index}
                >
                  <button
                    type="button"
                    class:selected={index === selectedIndex}
                    aria-current={index === selectedIndex ? "true" : undefined}
                    aria-label={item.dateText}
                    onclick={() => selectItem(index)}
                    onmouseenter={() => handleEnter(index)}
                    onmouseleave={handleLeave}
                    onfocus={() => handleEnter(index)}
                    onblur={handleLeave}
                  >
                    <span class="dot"></span>
                    {#if item.isNewYear}
                      <span class="year-tick"></span>
                      <span class="year">{item.year}</span>
                    {/if}
                  </button>
                </li>
              {/each}
            </ol>
          </div>
        </div>
      </div>

      <button
        class="nav-btn right"
        type="button"
        onclick={next}
        disabled={selectedIndex === data.length - 1}
        aria-label="Next item"
      >
        Next
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24px"
          viewBox="0 -960 960 960"
          width="24px"
          ><path
            d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"
          /></svg
        >
      </button>
    </div>

    <div class="snapshot-content">
      <h2>{selectedItem.title}</h2>
      <em>{selectedItem.dateTextLongMonth}</em>
      <p>{selectedItem.description}</p>
    </div>
  </section>
{/if}

<style>
  :host {
    display: block;
    color: #111;
    font-family: Arial, sans-serif;
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  .snapshot-timeline {
    display: grid;
    gap: 1.5rem;
    /* height: 100vh; */
  }

  .snapshot-media {
    display: block;
    max-width: 900px;
    width: 100%;
    margin-inline: auto;
    height: 60vh;
    overflow: hidden;
  }

  .snapshot-media figure {
    margin: 0;
    width: 100%;
    height: 100%;
  }

  .snapshot-media img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .timeline-bar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
    max-width: 900px;
    width: 100%;
    height: 10vh;
    margin-inline: auto;
  }

  .timeline-shell {
    position: relative;
    min-width: 0;
  }

  .timeline-tooltip {
    position: absolute;
    bottom: calc(100% - 1.5rem);
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: var(--tooltip-font-size);
    line-height: 1.2;
    background: white;
    border: 1px solid #ddd;
    padding: 0.35rem 0.5rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
    /* z-index: 20; */
    pointer-events: none;
  }

  .timeline-track-wrap {
    position: relative;
    min-height: 3rem;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    scrollbar-width: none;
  }

  .timeline-track-wrap::-webkit-scrollbar {
    display: none;
  }

  .timeline-rail {
    position: relative;
    min-height: 3rem;
    height: 3rem;
  }

  .timeline-line {
    position: absolute;
    top: 50%;
    height: 4px;
    background: var(--timeline-line-color, #d9d9d9);
    transform: translateY(-50%);
    border-radius: 999px;
    z-index: 0;
  }

  .timeline-points {
    position: relative;
    list-style: none;
    margin: 0;
    padding: 0;
    min-height: 3rem;
  }

  .timeline-track-wrap,
  .timeline-rail,
  .timeline-points {
    min-height: 6.5rem;
  }

  .timeline-point {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  .timeline-point button {
    appearance: none;
    border: 0;
    background: transparent;
    cursor: pointer;
    padding: 0;
    font: inherit;
    color: inherit;
    position: relative;
    display: block;
  }

  .dot {
    display: block;
    width: clamp(10px, var(--timeline-circle-size), 30px);
    height: clamp(10px, var(--timeline-circle-size), 30px);
    border-radius: 50%;
    background: var(--timeline-circle-color, white);
    border: 3px solid var(--timeline-circle-border-color, #999);
    position: relative;
    z-index: 2;

    &:is(:hover, :focus-visible) {
      background: var(--btn-bg-hover-color, hsl(0 0% 50% / 0.05));
      color: var(--btn-hover-color, #dd3d3d);
    }
  }

  .year-tick {
    display: block;
    width: 2px;
    height: 10px;
    background: var(--timeline-year-color, gray);
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 50%;
    transform: translateX(-50%);
  }

  .year {
    position: absolute;
    color: var(--timeline-year-color, gray);
    top: calc(100% + 1.1rem); /* pushed down below the tick */
    left: 50%;
    transform: translateX(-50%);
    white-space: nowrap;
    line-height: 1;
    font-size: 0.75rem;
  }

  .timeline-point button.selected .dot {
    border-color: var(--timeline-circle-selected-border-color, #dd3d3d);
    transform: scale(1.1);
  }

  button.left:enabled:is(:hover, :focus-visible) > svg {
    /* animation: arrow-effect 2s; */
    animation: slide-left 2s ease-in-out 0s infinite normal none;
  }

  button.right:enabled:is(:hover, :focus-visible) > svg {
    /* animation: arrow-effect 2s; */
    animation: slide-right 2s ease-in-out 0s infinite normal none;
  }

  @keyframes slide-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-10px);
    }
  }

  @keyframes slide-right {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(10px);
    }
  }
  button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--btn-color, hsl(0 0% 50% / 0.15));
    background-color: var(--btn-bg-color, hsl(0 0% 50% / 0.15));
    border: 1px solid var(--btn-border-color, #dd3d3d);
    border-radius: 0.25rem;
    transition: background 0.5s;
    cursor: pointer;

    /* &:is(:hover, :focus-visible) {
      background: var(--btn-bg-hover-color, hsl(0 0% 50% / 0.05));
      color: var(--btn-hover-color, #dd3d3d);
    } */
  }

  button svg {
    fill: var(--btn-svg-color, #dd3d3d);
    inline-size: 1em;
    block-size: 1em;
  }
  .nav-btn {
    appearance: none;
    border: var(--btn-border-thickness) solid var(--btn-border-color, #dd3d3d);
    background-color: var(--btn-bg-color, purple);
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    font: inherit;
    &:is(:hover, :focus-visible) {
      background-color: var(--btn-bg-hover-color, hsl(0 0% 50% / 0.05));
      color: var(--btn-hover-color, #dd3d3d);
    }
  }

  .nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .snapshot-content {
    font-family: var(--box-font-family, 'IBM Plex Sans', system-ui, sans-serif);
    max-width: 900px;
    width: 100%;
    margin-inline: auto;
    /* text-align: left; */
    /* height: 15vh; */
    background-color: var(--text-box-bg-color, #ccc);
    border: var(--text-box-border-thickness, 2px) solid
      var(--text-box-border-color, transparent);
    border-radius: var(--text-box-border-radius, 0.5rem);
    padding: 1rem 1rem;
  }

  .snapshot-content h2 {
    color: var(--title-color, black);
    margin: 0 0 0.5rem;
    font-family: inherit;
    font-size: var(--title-font-size, 1.5rem);
    text-align: var(--title-alignment, left);
  }

  .snapshot-content em {
    display: block;
    margin-bottom: 0.75rem;
    color: var(--date-font-color, #666);
    font-family: inherit;
    font-style: normal;
    font-size: var(--date-font-size, 1rem);
    text-align: var(--date-alignment, left);
  }

  .snapshot-content p {
    margin: 0;
    line-height: 1.5;
    color: var(--description-font-color, black);
    font-family: inherit;
    font-size: var(--description-font-size, 1.5rem);
    text-align: var(--description-alignment, left);
  }

  @media (prefers-reduced-motion: no-preference) {
    .timeline-track-wrap {
      scroll-behavior: smooth;
    }
  }

  @media (max-width: 700px) {
    .timeline-tooltip {
      font-size: 0.8rem;
    }
    .snapshot-timeline {
      gap: 1rem;
    }

    .snapshot-media {
      height: 50vw; /* responsive height instead of auto */
      min-height: 200px;
    }

    .snapshot-content {
      height: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    /* Stack the timeline bar vertically, centering everything */
    .timeline-bar {
      grid-template-columns: 1fr 1fr; /* two equal columns for the buttons */
      grid-template-rows: auto auto; /* two rows: buttons, then timeline */
      height: auto;
      justify-items: center;
    }

    /* Hide the scrollable timeline on mobile */
    /* Timeline spans both columns, sits in row 1 */
    .timeline-shell {
      grid-column: 1 / -1; /* span full width */
      grid-row: 1;
      width: 100%; /* fill the available space */
    }

    /* Prev button moves to row 2, left column */
    .nav-btn.left {
      grid-column: 1;
      grid-row: 2;
      justify-self: end;
      padding-right: 1.5rem;
    }

    /* Next button moves to row 2, right column */
    .nav-btn.right {
      grid-column: 2;
      grid-row: 2;
      justify-self: start;
      padding-left: 1.5rem;
    }
  }
</style>
