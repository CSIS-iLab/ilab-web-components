<svelte:options
  customElement={{
    tag: "csis-text-typing",
    props: {
      p1: { attribute: "first-p", type: "String" },
      p2: { attribute: "second-p", type: "String" },
      p3: { attribute: "third-p", type: "String" },
      bgColor: { attribute: "bg-color", type: "String" },
      animationDuration: { attribute: "animation-duration", type: "String" },

      /* fonts */
      fontUrl: { attribute: "font-url", type: "String" },
      fontFamily: { attribute: "font-family", type: "String" },
      fontSize: { attribute: "font-size", type: "String" },
      fontColor: { attribute: "font-color", type: "String" },
    },
  }}
/>

<script>
  import { onMount } from "svelte";
  let {
    p1 = "Text slider with",
    p2 = "typing animation effect",
    p3 = "in pure CSS.",
    bgColor = "#ffcc00",
    animationDuration = "5s",
    /* fonts */
    fontUrl = "",
    fontFamily = "'IBM Plex Sans', system-ui, sans-serif",
    fontSize = "1rem",
    fontColor = "#000",
  } = $props();

  onMount(() => {
    if (!fontUrl) return;

    // avoid adding duplicate <link> tags if multiple components use same font
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
</script>

<div
  class="container"
  style={`--bg-color: ${bgColor};
    --font-size: ${fontSize};
    --font-color: ${fontColor};
    --typing-font-family: ${fontFamily};
    --animation-duration: ${animationDuration}`}
>
  <div class="typing-slider">
    <p><span class="line line-1">{p1}</span></p>
    <p><span class="line line-2">{p2}</span></p>
    <p><span class="line line-3">{p3}</span></p>
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
      border-left-color: black;
    }
    99% {
      width: 0;
      border-left-color: black;
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
      border-left-color: black;
    }
  }

  .typing-slider {
    font-family: var(--typing-font-family);
    font-weight: bold;
    font-size: clamp(1rem, 5vw, var(--font-size, 2.5rem));
    color: var(--font-color, #000);
    text-align: left;
    white-space: normal;
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
    animation-duration: var(--animation-duration, 5s), 1s;
    animation-iteration-count: 1, 0; /* blink off by default */
    animation-fill-mode: forwards, none;
  }

  /* line 1: types from 0 → D, no blinking */
  .typing-slider .line-1::after {
    animation-delay: 0s, var(--animation-duration, 5s);
    animation-timing-function: steps(16, end), step-end;
  }

  /* line 2: types from D → 2D, no blinking */
  .typing-slider .line-2::after {
    animation-delay:
      var(--animation-duration, 5s), calc(2 * var(--animation-duration, 5s));
    animation-timing-function: steps(23, end), step-end;
  }

  /* line 3: types from 2D → 3D, then cursor blinks forever */
  .typing-slider .line-3::after {
    /* typing from 2D to 3D, blink starts at 3D */
    animation-delay:
      calc(2 * var(--animation-duration, 5s)),
      calc(3 * var(--animation-duration, 5s));

    animation-timing-function:
      steps(40, end), step-end; /* 40 ≈ chars in line 3 */

    /* typing once, blink forever */
    animation-iteration-count: 1, infinite;
  }

  /* ====== SMALL: 620px – 899.98px ====== */
  @media (min-width: 620px) and (max-width: 899.98px) {
    .container {
      padding: 0 2rem;
    }

    .typing-slider {
      font-size: clamp(1.25rem, 3.5vw, var(--font-size, 3rem));
      white-space: nowrap;
    }
  }

  /* ====== MEDIUM: 900px & above ====== */
  @media (min-width: 900px) {
    .container {
      padding: 0 3rem;
    }

    .typing-slider {
      font-size: var(--font-size, 3rem);
      white-space: nowrap;
    }
  }
</style>
