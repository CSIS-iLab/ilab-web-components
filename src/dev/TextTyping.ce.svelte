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
    animationDuration = 5,
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
    <p>{p3}</p>
  </div>
</div>

<style>
  :host {
    display: block;
  }

  .container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: var(--bg-color, #333);
  }
  @keyframes cursor {
    from,
    to {
      border-color: transparent;
    }
    50% {
      border-color: black;
    }
  }
  @keyframes typing {
    from {
      width: 100%;
    }
    90%,
    to {
      width: 0;
    }
  }
  @keyframes slide {
    33.3333333333% {
      font-size: var(--font-size);
      letter-spacing: 3px;
    }
    to {
      font-size: 0;
      letter-spacing: 0;
    }
  }
  .typing-slider {
    font-family: var(--typing-font-family);
    font-weight: bold;
    font-size: var(--font-size);
    color: var(--font-color);
    text-align: center;
    white-space: nowrap;
  }
  .typing-slider p {
    position: relative;
    display: inline;
    font-size: 0;
    text-transform: uppercase;
    letter-spacing: 0;
    animation: slide 15s step-start infinite;
  }
  .typing-slider p::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    border-left: 3px solid black;
    background-color: var(--bg-color);
    animation:
      typing var(--animation-duration) infinite,
      cursor 1s infinite;
  }
  .typing-slider p:nth-child(1) {
    animation-delay: 0s;
  }
  .typing-slider p:nth-child(1)::after {
    animation-delay: 0s;
    animation-timing-function: steps(16), step-end;
  }
  .typing-slider p:nth-child(2) {
    animation-delay: 5s;
  }
  .typing-slider p:nth-child(2)::after {
    animation-delay: 5s;
    animation-timing-function: steps(23), step-end;
  }
  .typing-slider p:nth-child(3) {
    animation-delay: 10s;
  }
  .typing-slider p:nth-child(3)::after {
    animation-delay: 10s;
    animation-timing-function: steps(12), step-end;
  }
</style>
