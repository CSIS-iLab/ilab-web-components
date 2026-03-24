<svelte:options
  customElement={{
    tag: "csis-satellite-snapshot",
    props: {
      dataURL: { attribute: "data-url", type: "String" },
    },
  }}
/>

<script>
  import { onMount } from "svelte"
  import { getData } from "./api/data"

  let data = $state([])
  let selectedIndex = $state(0)

  let {
    dataURL = "",
  } = $props()

  onMount(async () => {
    if (!dataURL) return

    try {
      data = await getData(dataURL)
      selectedIndex = data.length ? data.length - 1 : 0
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  })

  const selectedItem = $derived(data[selectedIndex])

  const minTime = $derived(data.length ? data[0].timestamp : 0)
  const maxTime = $derived(data.length ? data[data.length - 1].timestamp : 0)
  const totalRange = $derived(maxTime - minTime || 1)

  const positionedItems = $derived(
    data.map((item) => ({
      ...item,
      position: ((item.timestamp - minTime) / totalRange) * 100,
    }))
  )

  const progress = $derived(
    positionedItems.length ? (positionedItems[selectedIndex]?.position ?? 0) : 0
  )

  function selectItem(index) {
    selectedIndex = index
  }

  function prev() {
    if (selectedIndex > 0) selectedIndex -= 1
  }

  function next() {
    if (selectedIndex < positionedItems.length - 1) selectedIndex += 1
  }
</script>

{#if selectedItem}
  <section class="snapshot-timeline">
    <div class="snapshot-media">
      <figure>
        <img
          src={selectedItem.imageLink}
          alt={selectedItem.imageAlt}
        />
      </figure>
    </div>

    <div class="timeline-bar" aria-label="Timeline navigation">
      <button
        class="nav-btn"
        type="button"
        onclick={prev}
        disabled={selectedIndex === 0}
        aria-label="Previous item"
      >
        Prev
      </button>

      <div class="timeline-track-wrap">
        <div class="timeline-track"></div>
        <div class="timeline-fill" style={`width: ${progress}%`}></div>

        <ol class="timeline-points">
          {#each positionedItems as item, index}
            <li
              class="timeline-point"
              style={`left: ${item.position}%`}
            >
              <button
                type="button"
                class:selected={index === selectedIndex}
                aria-current={index === selectedIndex ? "true" : undefined}
                aria-label={item.dateText}
                onclick={() => selectItem(index)}
              >
                <span class="dot"></span>
                <span class="hover-date">{item.dateText}</span>
              </button>
            </li>
          {/each}
        </ol>
      </div>

      <button
        class="nav-btn"
        type="button"
        onclick={next}
        disabled={selectedIndex === positionedItems.length - 1}
        aria-label="Next item"
      >
        Next
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
    width: 100%;
    color: #111;
    font-family: Arial, sans-serif;
  }

  .snapshot-timeline {
    display: grid;
    gap: 1.5rem;
    /* width: 100%; */
    height: 100vh;
  }

  .snapshot-media figure {
    margin: 0;
  }

  .snapshot-media img {
    display: block;
    width: 100%;
    max-width: 900px;
    margin-inline: auto;
    height: auto;
    object-fit: cover;
  }

  .timeline-bar {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 1rem;
  }

  .timeline-track-wrap {
    position: relative;
    min-height: 5rem;
    padding-block: 1.5rem 2.5rem;
  }

  .timeline-track,
  .timeline-fill {
    position: absolute;
    left: 0;
    top: 1.9rem;
    height: 4px;
    border-radius: 999px;
  }

  .timeline-track {
    width: 100%;
    background: #d9d9d9;
  }

  .timeline-fill {
    background: #111;
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
    top: 0;
    transform: translateX(-50%);
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

  .hover-date {
    position: absolute;
    left: 50%;
    bottom: calc(100% + 0.5rem);
    transform: translateX(-50%) translateY(0.25rem);
    white-space: nowrap;
    font-size: 0.8rem;
    line-height: 1.2;
    background: white;
    border: 1px solid #ddd;
    padding: 0.35rem 0.5rem;
    border-radius: 0.375rem;
    box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
    opacity: 0;
    pointer-events: none;
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .timeline-point button:hover .hover-date,
  .timeline-point button:focus-visible .hover-date,
  .timeline-point button.selected .hover-date {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
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
    margin-inline: auto;
    text-align: left;
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

  @media (max-width: 700px) {
    .timeline-bar {
      grid-template-columns: 1fr;
    }

    .nav-btn {
      justify-self: start;
    }
  }
</style>
