<svelte:options
  customElement={{
    tag: "csis-text-typing",
    props: {
      p1: { attribute: "first-p", type: "String" },
      p2: { attribute: "second-p", type: "String" },
      p3: { attribute: "third-p", type: "String" },

      // NEW: dynamic lines as JSON string
      lines: { attribute: "lines", type: "String" },

      bgColor: { attribute: "bg-color", type: "String" },
      animationDuration: { attribute: "animation-duration", type: "String" },

      /* fonts */
      fontUrl: { attribute: "font-url", type: "String" },
      fontFamily: { attribute: "font-family", type: "String" },
      fontSize: { attribute: "font-size", type: "String" },
      fontColor: { attribute: "font-color", type: "String" },

      // NEW: cursor color
      cursorColor: { attribute: "cursor-color", type: "String" },
    },
  }}
/>

<script>
  import { onMount } from "svelte";

  let {
    p1 = "Text slider with",
    p2 = "typing animation effect",
    p3 = "in pure CSS.",

    // NEW: optional JSON array of lines
    lines: linesJson = "",

    bgColor = "#ffcc00",
    animationDuration = "5s",

    /* fonts */
    fontUrl = "",
    fontFamily = "'IBM Plex Sans', system-ui, sans-serif",
    fontSize = "1rem",
    fontColor = "#000",

    // NEW: cursor color prop
    cursorColor = "#000",
  } = $props();

  // --- font loading stays the same ---
  onMount(() => {
    if (!fontUrl) return;

    const existing = document.querySelector(
      `link[data-csis-font="${fontUrl}"]`,
    );
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.dataset.csisFont = fontUrl;
    document.head.appendChild(link);
  });

  // --- helper: parse "5s" / "5000ms" / "5" into seconds ---
  function durationToSeconds(str) {
    if (!str) return 5;
    const trimmed = String(str).trim().toLowerCase();

    if (trimmed.endsWith("ms")) {
      const num = parseFloat(trimmed.slice(0, -2));
      return isNaN(num) ? 5 : num / 1000;
    }
    if (trimmed.endsWith("s")) {
      const num = parseFloat(trimmed.slice(0, -1));
      return isNaN(num) ? 5 : num;
    }
    const num = parseFloat(trimmed);
    return isNaN(num) ? 5 : num;
  }

  const lineDurationSeconds = durationToSeconds(animationDuration);

  // --- compute lines array: JSON attribute takes precedence, fall back to p1/p2/p3 ---
  /** @type {string[]} */
  let lines = [];

  if (linesJson && linesJson.trim()) {
    try {
      const parsed = JSON.parse(linesJson);
      if (Array.isArray(parsed)) {
        lines = parsed.map((l) => String(l)).filter((l) => l.trim().length > 0);
      }
    } catch (_e) {
      // ignore parse error, fall back to p1/p2/p3
    }
  }

  if (!lines.length) {
    lines = [p1, p2, p3].filter((l) => l && l.trim().length > 0);
  }

  const totalLines = lines.length;
</script>

<div
  class="container"
  style={`--bg-color: ${bgColor};
    --font-size: ${fontSize};
    --font-color: ${fontColor};
    --typing-font-family: ${fontFamily};
    --line-duration: ${lineDurationSeconds};
    --cursor-color: ${cursorColor};`}
>
  <div class="typing-slider">
    {#each lines as line, index}
      <!-- For each line we set per-line CSS vars: --typing-delay: when its typing
      starts --cursor-delay: when blinking starts (after ALL lines typed)
      --cursor-iterations: 0 for all but last line; infinite for last line
      --typing-steps: approximate number of "characters" for steps() -->
      <p>
        <span
          class="line"
          style={`
            --typing-delay: ${index * lineDurationSeconds}s;
            --cursor-delay: ${totalLines * lineDurationSeconds}s;
            --cursor-iterations: ${index === totalLines - 1 ? "infinite" : "0"};
            --typing-steps: ${Math.max(line.length, 1)};
          `}
        >
          {line}
        </span>
      </p>
    {/each}
  </div>
</div>

<style>
  :host {
    display: block;
  }

  /* ====== BASE (XS: < 620px) ====== */
  .container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    min-height: 100vh;
    padding: 0 1.5rem;
    background-color: var(--bg-color, #333);
    box-sizing: border-box;
  }

  /* cover + typing on each line */
  @keyframes typingLine {
    0% {
      width: 100%;
      border-left-color: var(--cursor-color, #000);
    }
    99% {
      width: 0;
      border-left-color: var(--cursor-color, #000);
    }
    100% {
      width: 0;
      border-left-color: transparent; /* hide cursor at end for this line */
    }
  }

  /* blink for final cursor (last line only) */
  @keyframes cursorBlink {
    0%,
    50% {
      border-left-color: transparent;
    }
    51%,
    100% {
      border-left-color: var(--cursor-color, #000);
    }
  }

  .typing-slider {
    font-family: var(--typing-font-family);
    font-weight: bold;
    font-size: clamp(1rem, 5vw, var(--font-size, 2.5rem));
    color: var(--font-color, #000);
    text-align: left;
    white-space: nowrap;
    margin-inline: auto;
  }

  .typing-slider p {
    margin: 0.25em 0;
  }

  /* The actual typed line (shrinks to text width) */
  .typing-slider .line {
    position: relative;
    display: inline-block; /* width = text width */
  }

  /* base: all lines get a typing cover, no blink by default */
  .typing-slider .line::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0; /* cover from the right edge of text */
    bottom: 0;
    width: 100%;
    border-left: 2px solid transparent;
    background-color: var(--bg-color, #333);

    /* two animations: typing + (optional) blink */
    animation-name: typingLine, cursorBlink;
    animation-duration: calc(var(--line-duration, 5) * 1s), 1s;
    animation-delay: var(--typing-delay, 0s), var(--cursor-delay, 0s);
    animation-iteration-count: 1, var(--cursor-iterations, 0);
    animation-timing-function: steps(var(--typing-steps, 20), end), step-end;
    animation-fill-mode: forwards, none;
  }

  /* ====== SMALL: 620px – 899.98px ====== */
  @media (min-width: 620px) and (max-width: 899.98px) {
    .container {
      padding: 0 2rem;
    }

    .typing-slider {
      font-size: clamp(1.25rem, 3.5vw, var(--font-size, 3rem));
    }
  }

  /* ====== MEDIUM: 900px & above ====== */
  @media (min-width: 900px) {
    .container {
      padding: 0 3rem;
    }

    .typing-slider {
      font-size: var(--font-size, 3rem);
    }
  }
</style>
