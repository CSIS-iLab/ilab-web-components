<svelte:options
  customElement={{
    tag: "csis-scroll-to-bloom",
    props: {
      dataURL: { attribute: "data-url", type: "String" },
      description: { attribute: "description", type: "String" },
      title: { attribute: "title", type: "String" },
      titleLink: { attribute: "title-link", type: "String" },
      bgImage: { attribute: "image", type: "String" },
      bgImageAlt: { attribute: "image-alt", type: "String" },
    },
    extend: (BaseElement) =>
      class extends BaseElement {
        connectedCallback() {
          super.connectedCallback()

          const root = this.shadowRoot
          if (root && !root.querySelector("style[data-shared-tokens]")) {
            const style = document.createElement("style")
            style.setAttribute("data-shared-tokens", "")
            style.textContent = sharedCss
            root.prepend(style)
          }
        }
      },
  }}
/>

<script module>
  import tokensCss from "./styles/styles.css?inline"
  import normalizeCss from "./styles/normalize.min.css?inline"

  const sharedCss = `${tokensCss}\n${normalizeCss}`
</script>

<script>
  import { onMount, onDestroy } from "svelte"
  import { getData } from "./api/data"

  let data = $state([])
  let {
    dataURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQo-OXqVYW_x9qJwWYt1XDE9BkmOKuY4EUTLCPnXLusy00g3EdvbDkg8QE4exYVY315S02Hnwz5vKrj/pub?gid=0&single=true&output=csv",
    description = "Bacon ipsum dolor amet pariatur do ribeye, tri-tip aliqua pig brisket in pork chop proident salami.",
    title = "Bacon ipsum dolor",
    titleLink = "https://baconipsum.com",
    bgImage = "https://baconipsum.com/wp-content/themes/baconipsum-custom-theme-v2/images/bacon-ipsum-banner1.jpg",
    bgImageAlt = "Bacon ipsum dolor banner",
  } = $props()

  onMount(async () => {
    if (!dataURL) return
    try {
      data = await getData(dataURL)
    } catch (error) {
      console.error("Error fetching data: ", error)
    }
  })
  // $inspect(data)
</script>

<header>
  <h1>
    <a href={titleLink} target="_blank" rel="noopener noreferrer">{title}</a>
  </h1>
  <p>{description}</p>
  <img src={bgImage} alt={bgImageAlt} />
</header>
<main>
  {#if data.length}
    {#each data as item}
      <div class="card-animation-layer">
        <article class="card">
          <img
            src={item.background_image}
            alt={item.background_image_alt}
            height="500"
            width="500"
          />
          <p>{item.description}</p>
          <a href={item.title_link} target="_blank">{item.title}</a>
        </article>
      </div>
    {/each}
  {/if}
</main>

<style>
  @keyframes slide-in {
    from {
      scale: 0.85;
      rotate: calc((var(--side, 1) * (5deg * var(--amp, 1))));
    }
  }

  @layer card-animation {
    .card-animation-layer {
      @media (prefers-reduced-motion: no-preference) {
        @supports (animation-timeline: view()) {
          animation: slide-in linear both;
          animation-timeline: view();
          animation-range: cover 0% contain 15%;
        }
      }
    }
  }

  @layer host {
    :host {
      display: grid;
      place-content: end center;
      padding: var(--size-5);
      gap: var(--size-5);
    }

    main {
      --cols: 2;
      display: grid;
      grid-template-columns: repeat(
        var(--cols),
        minmax(0, var(--size-content-1))
      );
      gap: var(--size-5);
      padding-inline: var(--size-5);
      padding-block: 75svh 50svh;
      place-items: start;

      @media (width >= 720px) {
        --cols: 4;
      }
      @media (width >= 1200px) {
        --cols: 6;
      }
      @media (width >= 1920px) {
        --cols: 8;
      }

      & > .card-animation-layer {
        display: grid;
        gap: var(--size-2);

        &:nth-of-type(2n + 1) {
          transform-origin: 25vw 100%;
          --side: -1;
        }
        &:nth-of-type(2n) {
          transform-origin: -25vw 100%;
          --side: 1;
        }

        @media (width >= 720px) {
          &:nth-of-type(4n + 1) {
            transform-origin: 50vw 100%;
            --side: -1;
            --amp: 2;
          }
          &:nth-of-type(4n + 2) {
            transform-origin: 25vw 100%;
            --side: -1;
          }
          &:nth-of-type(4n + 3) {
            transform-origin: -25vw 100%;
            --side: 1;
          }
          &:nth-of-type(4n) {
            transform-origin: -50vw 100%;
            --side: 1;
            --amp: 2;
          }
        }

        @media (width >= 1200px) {
          &:nth-of-type(6n + 1) {
            transform-origin: 75vw 100%;
            --side: -1;
            --amp: 3;
          }
          &:nth-of-type(6n + 2) {
            transform-origin: 50vw 100%;
            --side: -1;
            --amp: 2;
          }
          &:nth-of-type(6n + 3) {
            transform-origin: 25vw 100%;
            --side: -1;
          }
          &:nth-of-type(6n + 4) {
            transform-origin: -25vw 100%;
            --side: 1;
          }
          &:nth-of-type(6n + 5) {
            transform-origin: -50vw 100%;
            --side: 1;
            --amp: 2;
          }
          &:nth-of-type(6n) {
            transform-origin: -75vw 100%;
            --side: 1;
            --amp: 3;
          }
        }

        @media (width >= 1920px) {
          &:nth-of-type(8n + 1) {
            transform-origin: 100vw 100%;
            --side: -1;
            --amp: 4;
          }
          &:nth-of-type(8n + 2) {
            transform-origin: 75vw 100%;
            --side: -1;
            --amp: 3;
          }
          &:nth-of-type(8n + 3) {
            transform-origin: 50vw 100%;
            --side: -1;
            --amp: 2;
          }
          &:nth-of-type(8n + 4) {
            transform-origin: 25vw 100%;
            --side: -1;
          }
          &:nth-of-type(8n + 5) {
            transform-origin: -25vw 100%;
            --side: 1;
          }
          &:nth-of-type(8n + 6) {
            transform-origin: -50vw 100%;
            --side: 1;
            --amp: 2;
          }
          &:nth-of-type(8n + 7) {
            transform-origin: -75vw 100%;
            --side: 1;
            --amp: 3;
          }
          &:nth-of-type(8n) {
            transform-origin: -100vw 100%;
            --side: 1;
            --amp: 4;
          }
        }
      }
    }

    .card {
      background: var(--surface-2);
      border: 1px solid color-mix(in srgb, var(--surface-4), #0000 50%);
      padding-block: var(--size-3) var(--size-2);
      padding-inline: var(--size-3);
      border-radius: var(--radius-4);
      box-shadow: var(--shadow-4);

      &.landscape img {
        aspect-ratio: var(--ratio-landscape);
      }
      &.portrait img {
        aspect-ratio: var(--ratio-portrait);
      }
      &.square img {
        aspect-ratio: var(--ratio-square);
      }

      & > p {
        color: var(--text-2);
        line-clamp: 2;
      }

      & > :is(a, p) {
        font-size: var(--font-size-1);
        line-height: 1.25;
      }

      img {
        background-color: var(--surface-3);
        border-radius: var(--radius-3);
        margin-block-end: var(--size-2);
      }

      @media (prefers-color-scheme: light) {
        background: white;
      }
    }

    h5 {
      max-inline-size: 100%;
      text-align: center;
    }
  }
</style>
