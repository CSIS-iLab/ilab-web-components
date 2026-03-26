<svelte:options
  customElement={{
    tag: "csis-satellite-snapshot",
    props: {
      dataURL: { attribute: "data-url", type: "String" },
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

  let { dataURL = "" } = $props()

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
  <section class="snapshot-timeline">
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
          fill="#e3e3e3"
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
          fill="#e3e3e3"
          ><path
            d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"
          /></svg
        >
      </button>
    </div>

    <div class="snapshot-content">
      <h2>{selectedItem.title}</h2>
      <em>{selectedItem.dateText}</em>
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
    bottom: calc(100% + 0.5rem);
    transform: translateX(-50%);
    white-space: nowrap;
    font-size: 0.8rem;
    line-height: 1.2;
    background: white;
    border: 1px solid #ddd;
    padding: 0.35rem 0.5rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
    z-index: 20;
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
    background: #d9d9d9;
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
  }

  .dot {
    display: block;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: white;
    border: 3px solid #999;
    transition:
      transform 0.2s ease,
      border-color 0.2s ease;
    position: relative;
    z-index: 2;
  }

  .timeline-point button.selected .dot {
    border-color: #111;
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
    background-color: hsl(0 0% 50% / 0.15);
    border: 1px solid hsl(0, 0%, 90%);
    border-radius: 0.25rem;
    transition: background 0.5s;
    cursor: pointer;

    &:is(:hover, :focus-visible) {
      background: hsl(0 0% 50% / 0.05);
    }
  }

  button svg {
    fill: light-dark(black, white);
    inline-size: 1em;
    block-size: 1em;
  }
  .nav-btn {
    appearance: none;
    border: 1px solid #ccc;
    background: white;
    padding: 0.5rem 0.75rem;
    cursor: pointer;
    font: inherit;
  }

  .nav-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .snapshot-content {
    max-width: 900px;
    width: 100%;
    margin-inline: auto;
    text-align: left;
    height: 15vh;
    background-color: #ccc;
    border-radius: 0.5rem;
    padding: 3rem 1rem;
  }

  .snapshot-content h2 {
    margin: 0 0 0.5rem;
    font-size: 1.5rem;
  }

  .snapshot-content em {
    display: block;
    margin-bottom: 0.75rem;
    color: #666;
    font-style: italic;
  }

  .snapshot-content p {
    margin: 0;
    line-height: 1.5;
  }

  @media (prefers-reduced-motion: no-preference) {
    .timeline-track-wrap {
      scroll-behavior: smooth;
    }
  }

  @media (max-width: 700px) {
    .timeline-bar {
      grid-template-columns: 1fr;
      height: auto;
    }

    .nav-btn {
      justify-self: start;
    }

    .snapshot-media {
      height: auto;
    }

    .snapshot-content {
      height: auto;
    }
  }
</style>
