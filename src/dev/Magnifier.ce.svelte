<svelte:options
  customElement={{
    tag: "csis-magnifier",
    props: {
      title: { attribute: "title", type: "String" },
      bgImage: { attribute: "background-image", type: "String" },
      bgImageAlt: {
        attribute: "background-image-alt",
        type: "String",
      },
      magnifierZoom: { attribute: "magnifier-zoom", type: "Number" },
    },
  }}
/>

<script>
  import { onMount, onDestroy } from "svelte";

  let {
    title = "",
    bgImage = "https://res.cloudinary.com/csisideaslab/image/upload/v1729626172/dev-team/smfeogcut8mzuv4rxge3.png",
    bgImageAlt = "Saint Seiya",
    magnifierZoom = 2,
  } = $props();

  let img; // we'll bind the <img> element here
  let cleanup = () => {}; // will hold our teardown function
  const zoom = magnifierZoom;

  onMount(() => {
    if (!img) return;

    const initMagnifier = () => {
      if (!img) return;

      // Create magnifier glass:
      const glass = document.createElement("div");
      glass.className = "img-magnifier-glass";

      // Insert magnifier glass before the image:
      img.parentElement.insertBefore(glass, img);

      // Set background properties:
      glass.style.backgroundImage = `url('${img.src}')`;
      glass.style.backgroundRepeat = "no-repeat";
      glass.style.backgroundSize =
        img.width * zoom + "px " + img.height * zoom + "px";

      const bw = 3;
      const w = glass.offsetWidth / 2;
      const h = glass.offsetHeight / 2;

      function getCursorPos(e) {
        e = e || window.event;
        const rect = img.getBoundingClientRect();
        let x = e.pageX - rect.left;
        let y = e.pageY - rect.top;
        x = x - window.pageXOffset;
        y = y - window.pageYOffset;
        return { x, y };
      }

      function moveMagnifier(e) {
        e.preventDefault();
        const pos = getCursorPos(e);
        let x = pos.x;
        let y = pos.y;

        // Keep glass inside the image:
        if (x > img.width - w / zoom) x = img.width - w / zoom;
        if (x < w / zoom) x = w / zoom;
        if (y > img.height - h / zoom) y = img.height - h / zoom;
        if (y < h / zoom) y = h / zoom;

        // Position the glass:
        glass.style.left = x - w + "px";
        glass.style.top = y - h + "px";

        // Show zoomed background:
        glass.style.backgroundPosition =
          "-" + (x * zoom - w + bw) + "px -" + (y * zoom - h + bw) + "px";
      }

      // Attach listeners:
      const opts = { passive: false };
      glass.addEventListener("mousemove", moveMagnifier);
      img.addEventListener("mousemove", moveMagnifier);
      glass.addEventListener("touchmove", moveMagnifier, opts);
      img.addEventListener("touchmove", moveMagnifier, opts);

      // Teardown:
      cleanup = () => {
        glass.removeEventListener("mousemove", moveMagnifier);
        img.removeEventListener("mousemove", moveMagnifier);
        glass.removeEventListener("touchmove", moveMagnifier);
        img.removeEventListener("touchmove", moveMagnifier);
        glass.remove();
      };
    };

    // Make sure image is loaded so width/height are correct
    if (img.complete) {
      initMagnifier();
    } else {
      img.addEventListener("load", initMagnifier, { once: true });
    }
  });

  onDestroy(() => {
    cleanup();
  });
</script>

<div class="img-magnifier-container">
  <img bind:this={img} src={bgImage} alt={bgImageAlt} />
</div>

<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
  :global {
    .link-image {
      border-bottom: none;
    }

    .img-magnifier-container {
      position: relative;
      width: 100%;
      height: 100%;
    }
    .img-magnifier-container img {
      display: block;
      max-width: 100%;
      width: 100%;
    }
    .img-magnifier-glass {
      position: absolute;
      border: 3px solid #000;
      border-radius: 50%;
      cursor: none;
      /*Set the size of the magnifier glass:*/
      width: 150px;
      height: 150px;
      z-index: 99999;
    }
  }
</style>
