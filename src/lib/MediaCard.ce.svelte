<svelte:options
  customElement={{
    tag: "csis-media-card",
    props: {
      title: { type: "String", reflect: true },
      backgroundSrc: {
        attribute: "background-src",
        type: "String",
        reflect: true,
      },
      posterSrc: {
        attribute: "poster-src",
        type: "String",
        reflect: true,
      },
      imageSrc: {
        attribute: "image-src",
        type: "String",
        reflect: true,
      },
      imageAlt: {
        attribute: "image-alt",
        type: "String",
        reflect: true,
      },
      overlayColor: {
        attribute: "overlay-color",
        type: "String",
        reflect: true,
      },
      overlayOpacity: {
        attribute: "overlay-opacity",
        type: "Number",
        reflect: true,
      },
      borderColor: {
        attribute: "border-color",
        type: "String",
        reflect: true,
      },
      titleColor: {
        attribute: "title-color",
        type: "String",
        reflect: true,
      },
      height: { type: "String", reflect: true },
      radius: { type: "String", reflect: true },
      imageShape: {
        attribute: "image-shape",
        type: "String",
        reflect: true,
      },
      imageSize: {
        attribute: "image-size",
        type: "String",
        reflect: true,
      },
      paused: { type: "Boolean", reflect: true },
      width: { type: "String", reflect: true },
      borderWidth: {
        attribute: "border-width",
        type: "String",
        reflect: true,
      },
      fontUrl: {
        attribute: "font-url",
        type: "String",
        reflect: true,
      },
      titleFontFamily: {
        attribute: "title-font-family",
        type: "String",
        reflect: true,
      },
      titleFontSize: {
        attribute: "title-font-size",
        type: "String",
        reflect: true,
      },
      titleFontWeight: {
        attribute: "title-font-weight",
        type: "String",
        reflect: true,
      },
      titleFontStyle: {
        attribute: "title-font-style",
        type: "String",
        reflect: true,
      },
      imageOpacity: {
        attribute: "image-opacity",
        type: "Number",
        reflect: true,
      },
    },
  }}
/>

<script>
  import { onMount } from "svelte";

  let {
    title = "",
    backgroundSrc = "",
    posterSrc = "",
    imageSrc = "",
    imageAlt = "",
    overlayColor = "#081a2e",
    overlayOpacity = 0.45,
    borderColor = "#d6b54c",
    titleColor = "#ffffff",
    height = "420px",
    radius = "24px",
    imageShape = "circle",
    imageSize = "70%",
    paused = false,
    width = "100%",
    borderWidth = "1px",
    fontUrl = "",
    titleFontFamily = "inherit",
    titleFontSize = "clamp(1.4rem, 2vw, 2rem)",
    titleFontWeight = "500",
    titleFontStyle = "normal",
    imageOpacity = 1,
  } = $props();

  let rootEl;
  let videoEl;
  let prefersReducedMotion = false;

  $effect(() => {
    if (!fontUrl) return;

    const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
    if (existingLink) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  });

  function normalizeOpacity(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return 0.45;
    return Math.max(0, Math.min(1, n));
  }

  $effect(() => {
    if (!rootEl) return;

    rootEl.style.setProperty("--card-height", height);
    rootEl.style.setProperty("--card-radius", radius);
    rootEl.style.setProperty("--card-border-color", borderColor);
    rootEl.style.setProperty("--card-title-color", titleColor);
    rootEl.style.setProperty("--card-overlay-color", overlayColor);
    rootEl.style.setProperty(
      "--card-overlay-opacity",
      String(normalizeOpacity(overlayOpacity)),
    );
    rootEl.style.setProperty("--card-image-size", imageSize);
    rootEl.style.setProperty("--card-width", width);
    rootEl.style.setProperty("--card-border-width", borderWidth);
    rootEl.style.setProperty("--card-title-font-family", titleFontFamily);
    rootEl.style.setProperty("--card-title-font-size", titleFontSize);
    rootEl.style.setProperty("--card-title-font-weight", titleFontWeight);
    rootEl.style.setProperty("--card-title-font-style", titleFontStyle);
    rootEl.style.setProperty(
      "--card-image-opacity",
      String(normalizeOpacity(imageOpacity)),
    );
  });

  function syncPlayback() {
    if (!videoEl) return;

    const shouldPause = paused || prefersReducedMotion;

    if (shouldPause) {
      videoEl.pause();
      return;
    }

    const playPromise = videoEl.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // Ignore autoplay failures.
      });
    }
  }

  onMount(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      prefersReducedMotion = mediaQuery.matches;
      syncPlayback();
    };

    updateMotionPreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateMotionPreference);
    } else {
      mediaQuery.addListener(updateMotionPreference);
    }

    syncPlayback();

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", updateMotionPreference);
      } else {
        mediaQuery.removeListener(updateMotionPreference);
      }
    };
  });

  $effect(() => {
    syncPlayback();
  });

  function getImageShapeClass(shape) {
    if (shape === "rounded" || shape === "round") return "card__media--rounded";
    if (shape === "none") return "card__media--none";
    return "card__media--circle";
  }
</script>

<div class="card" bind:this={rootEl}>
  <div class="card__bg" aria-hidden="true">
    {#if backgroundSrc}
      <video
        bind:this={videoEl}
        class="card__video"
        src={backgroundSrc}
        poster={posterSrc || undefined}
        muted
        loop
        playsinline
        preload="metadata"
      ></video>
    {:else}
      <div class="card__bg-fallback"></div>
    {/if}
  </div>

  <div class="card__overlay" aria-hidden="true"></div>

  <div class="card__content">
    {#if title}
      <h3 class="card__title">{title}</h3>
    {/if}

    {#if imageSrc}
      <div class={`card__media ${getImageShapeClass(imageShape)}`}>
        <img class="card__image" src={imageSrc} alt={imageAlt} />
      </div>
    {/if}

    <slot></slot>
  </div>
</div>

<style>
  :host {
    display: block;
  }

  .card {
    --card-height: 420px;
    --card-radius: 24px;
    --card-border-color: #d6b54c;
    --card-title-color: #ffffff;
    --card-overlay-color: #081a2e;
    --card-overlay-opacity: 0.45;
    --card-image-size: 70%;
    --card-title-font-family: inherit;
    --card-title-font-size: clamp(1.4rem, 2vw, 2rem);
    --card-title-font-weight: 500;
    --card-title-font-style: normal;
    --card-image-opacity: 1;

    width: min(100%, var(--card-width));
    max-width: var(--card-width);
    position: relative;
    min-height: var(--card-height);
    height: var(--card-height);
    overflow: hidden;
    border: var(--card-border-width) solid var(--card-border-color);
    border-radius: var(--card-radius);
    background: #06111c;
    isolation: isolate;
  }

  .card__bg,
  .card__overlay {
    position: absolute;
    inset: 0;
  }

  .card__bg {
    z-index: 0;
  }

  .card__video,
  .card__bg-fallback {
    width: 100%;
    height: 100%;
  }

  .card__video {
    display: block;
    object-fit: cover;
  }

  .card__bg-fallback {
    background: radial-gradient(
        circle at 30% 30%,
        rgba(255, 255, 255, 0.08),
        transparent 35%
      ),
      linear-gradient(180deg, #0b1c33 0%, #08111d 100%);
  }

  .card__overlay {
    z-index: 1;
    background: var(--card-overlay-color);
    opacity: var(--card-overlay-opacity);
    pointer-events: none;
  }

  .card__content {
    position: relative;
    z-index: 2;
    display: grid;
    justify-items: center;
    align-content: start;
    gap: 1rem;
    width: 100%;
    height: 100%;
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .card__title {
    margin: 0;
    color: var(--card-title-color);
    font-family: var(--card-title-font-family);
    font-size: var(--card-title-font-size);
    font-weight: var(--card-title-font-weight);
    font-style: var(--card-title-font-style);
    line-height: 1.1;
    text-align: center;
  }

  .card__media {
    --available-image-height: calc(var(--card-height) - 3rem - 2.4rem - 1rem);

    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);

    width: min(
      var(--card-image-size),
      calc(100% - 2rem),
      var(--available-image-height)
    );

    aspect-ratio: 1 / 1;
  }
  .card__media--circle {
    border-radius: 50%;
  }

  .card__media--rounded {
    border-radius: 24px;
  }

  .card__media--none {
    border-radius: 0;
  }

  .card__image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: var(--card-image-opacity);
  }

  ::slotted(*) {
    color: white;
    text-align: center;
    margin: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .card__video {
      animation: none;
    }
  }
</style>
