<svelte:options
  customElement={{
    tag: "csis-text-typing",
    props: {
      text: { attribute: "text", type: "String"},

      bgColor: { attribute: "bg-color", type: "String" },
      animationDuration: { attribute: "animation-duration", type: "String" },

      fontUrl: { attribute: "font-url", type: "String" },
      fontFamily: { attribute: "font-family", type: "String" },
      fontSize: { attribute: "font-size", type: "String" },
      fontColor: { attribute: "font-color", type: "String" },

      cursorColor: { attribute: "cursor-color", type: "String" },

      minHeight: { attribute: "min-height", type: "String" }
    },
  }}
/>

<script>
  import { onMount, tick } from "svelte";

  let {
    // preferred single-text input (supports \n and blank lines)
    text: textRaw = "",

    bgColor = "#ffcc00",
    cursorColor = "#000",
    animationDuration = "5s",

    /* fonts */
    fontUrl = "",
    fontFamily = "'IBM Plex Sans', system-ui, sans-serif",
    fontSize = "1rem",
    fontColor = "#000",

    // height control (defaults to hero)
    minHeight = "100vh", //attribute: min-height="60vh" or "600px"
  } = $props();

  /* -------------------- font loading -------------------- */
  onMount(() => {
    if (!fontUrl) return;

    const existing = document.querySelector(
      `link[data-csis-font="${fontUrl}"]`
    );
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    link.dataset.csisFont = fontUrl;
    document.head.appendChild(link);
  });

  /* --------------------- parse time --------------------- */
  function durationToMs(str) {
    if (!str) return 5000;
    const trimmed = String(str).trim().toLowerCase();
    if (trimmed.endsWith("ms")) {
      const num = parseFloat(trimmed.slice(0, -2));
      return Number.isFinite(num) ? num : 5000;
    }
    if (trimmed.endsWith("s")) {
      const num = parseFloat(trimmed.slice(0, -1));
      return Number.isFinite(num) ? num * 1000 : 5000;
    }
    const num = parseFloat(trimmed);
    return Number.isFinite(num) ? num * 1000 : 5000;
  }

  /* ------------- turn \n into real newlines ------------- */
  function unescapeNewlines(s) {
    return String(s)
      .replaceAll("\\r\\n", "\n")
      .replaceAll("\\n", "\n")
      .replaceAll("\\r", "\n");
  }

  function buildSourceText() {
    if (textRaw && String(textRaw).trim().length) {
      return unescapeNewlines(textRaw);
    }
  }

  let sourceText = $state(buildSourceText());
  let displayedText = $state("");
  let done = $state(false);

  let typingTimer = null;

  function stopTyping() {
    if (typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }

  async function startTyping() {
    stopTyping();
    done = false;
    displayedText = "";

    // wait for DOM update so wrapping/layout is corect before typing starts
    await tick();

    const full = sourceText ?? "";
    if (!full.length) {
      done = true;
      return;
    }

    const totalMs = durationToMs(animationDuration);
    const steps = Math.max(full.length, 1);
    const intervalMs = Math.max(10, Math.floor(totalMs / steps));

    let i = 0;
    typingTimer = setInterval(() => {
      i += 1;
      displayedText = full.slice(0, i);
      if (i >= full.length) {
        stopTyping();
        done = true;
      }
    }, intervalMs);
  }

  onMount(() => {
    sourceText = buildSourceText();
    startTyping();
    return stopTyping;
  });
</script>

<div
  class="container"
  style={`--bg-color: ${bgColor};
    --font-size: ${fontSize};
    --font-color: ${fontColor};
    --typing-font-family: ${fontFamily};
    --cursor-color: ${cursorColor};
    --min-height: ${minHeight};`}
>
  <div class="typing">
    <span class="typed">{displayedText}</span>
    <span class:done class="cursor" aria-hidden="true"></span>
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
    min-height: var(--min-height, 100vh);
    padding: 0 1.5rem;
    background-color: var(--bg-color, #333);
    box-sizing: border-box;
  }

  .typing {
    font-family: var(--typing-font-family);
    font-weight: bold;
    font-size: clamp(1rem, 5vw, var(--font-size, 2.5rem));
    color: var(--font-color, #000);
    text-align: left;

    /* ✅ this is the magic for responsiveness + blank lines */
    white-space: pre-wrap; /* preserves \n and wraps */
    overflow-wrap: anywhere; /* prevents overflow on long tokens */
    max-width: 100%;
    margin-inline: auto;
  }

  .typed {
    /* keep it inline so cursor sits right after the last char */
  }

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

  .cursor {
    display: inline-block;
    border-left: 2px solid var(--cursor-color, #000);
    margin-left: 0.08em;
    height: 1em;
    vertical-align: -0.1em;
    animation: cursorBlink 1s step-end infinite;
  }

  /* Optional: if you want cursor to blink only AFTER typing is done,
   remove the animation by default and enable when done is true. */
  .cursor:not(.done) {
    /* comment out next line if you want it blinking while typing */
    animation: none;
  }
  .cursor.done {
    animation: cursorBlink 1s step-end infinite;
  }

  /* ====== SMALL: 620px – 899.98px ====== */
  @media (min-width: 620px) and (max-width: 899.98px) {
    .container {
      padding: 0 2rem;
    }

    .typing {
      font-size: clamp(1.25rem, 3.5vw, var(--font-size, 3rem));
    }
  }

  /* ====== MEDIUM: 900px & above ====== */
  @media (min-width: 900px) {
    .container {
      padding: 0 3rem;
    }

    .typing {
      font-size: var(--font-size, 3rem);
    }
  }
</style>
