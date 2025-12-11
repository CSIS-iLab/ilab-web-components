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
    <p>{p1}</p>
    <p>{p2}</p>
    <p class="has-cursor">
      {p3}
      <span class="final-cursor" aria-hidden="true"></span>
    </p>
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

  /* cover animation: reveals text */
  @keyframes typing-line {
    from {
      width: 100%;
    }
    to {
      width: 0;
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
    position: relative;
    display: block;
    margin: 0.25em 0;
    font-size: inherit;
    letter-spacing: 0.08em;
  }

  /* cover each line with ::before */
  .typing-slider p::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0; /* cover from the right */
    bottom: 0;
    width: 100%; /* start fully covered */
    background-color: var(--bg-color, #333);

    animation-name: typing-line;
    animation-duration: var(--animation-duration, 5s);
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }

  /* line 1 types first */
  .typing-slider p:nth-child(1)::before {
    animation-delay: 0s;
    animation-timing-function: steps(16, end);
  }

  /* line 2 starts after line 1 */
  .typing-slider p:nth-child(2)::before {
    animation-delay: calc(1 * var(--animation-duration, 5s));
    animation-timing-function: steps(23, end);
  }

  /* line 3 starts after line 2 */
  .typing-slider p:nth-child(3)::before {
    animation-delay: calc(2 * var(--animation-duration, 5s));
    animation-timing-function: steps(12, end);
  }

  @keyframes cursor-blink {
    0%,
    50% {
      border-left-color: transparent;
    }
    51%,
    100% {
      border-left-color: black;
    }
  }

  /* last line wrapper */
  .typing-slider p.has-cursor {
    position: relative;
  }

  /* the final cursor itself */
  .typing-slider p.has-cursor .final-cursor {
    position: absolute;
    top: 0;
    right: 0; /* sit at the end of the text */
    bottom: 0;
    width: 0; /* we only need the border */
    border-left: 2px solid transparent; /* invisible until blink starts */

    animation-name: cursor-blink;
    animation-duration: 1s;
    animation-iteration-count: infinite;
    animation-timing-function: step-end;

    /* start blinking AFTER the last line is done typing:
       3 * duration = line1 + line2 + line3 */
    animation-delay: calc(3 * var(--animation-duration, 5s));
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
