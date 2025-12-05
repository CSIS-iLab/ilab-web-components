<svelte:options
  customElement={{
    tag: "csis-bootcamp-player",
    props: {
      title: { type: "String" }, // attribute defaults to "title"
      audioSrc: { attribute: "audio-src", type: "String" }, // attribute defaults to "src"
      captionHtml: { attribute: "caption-html", type: "String" },

      // Use camelCase prop names; map to hyphenated attributes
      speaker1Name: { attribute: "speaker1-name", type: "String" },
      speaker1Title: { attribute: "speaker1-title", type: "String" },
      speaker1Img: { attribute: "speaker1-img", type: "String" },

      speaker2Name: { attribute: "speaker2-name", type: "String" },
      speaker2Title: { attribute: "speaker2-title", type: "String" },
      speaker2Img: { attribute: "speaker2-img", type: "String" },

      speaker3Name: { attribute: "speaker3-name", type: "String" },
      speaker3Title: { attribute: "speaker3-title", type: "String" },
      speaker3Img: { attribute: "speaker3-img", type: "String" },

      speaker4Name: { attribute: "speaker4-name", type: "String" },
      speaker4Title: { attribute: "speaker4-title", type: "String" },
      speaker4Img: { attribute: "speaker4-img", type: "String" },
    },
  }}
/>

<script>
  let {
    title = "Educating the Next Consumer Generation",
    audioSrc = "https://journalism.csis.org/wp-content/uploads/2022/07/DePaulBootcampFinalMixdown_FoodWaste.mp3",
    captionHtml = `Background Music via&nbsp;<a class="audio-link" rel="noreferrer noopener" target="_blank" href="http://artlist.io/">Artlist.io</a> - "Hourglass" by Yehezkel Raz and Ian Post, "Colorful" by Eyal Raz`,

    /*speakers*/
    speaker1Name = "Speaker 1 Name",
    speaker1Title = "Speaker 1 Title",
    speaker1Img = "https://images.unsplash.com/photo-1573865526739-10659fec78a5?q=80&w=3961&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    speaker2Name = "Speaker 2 Name",
    speaker2Title = "Speaker 2 Title",
    speaker2Img = "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=3024&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

    // Optional speakers 3–4 (no defaults)
    speaker3Name = "",
    speaker3Title = "",
    speaker3Img = "",

    speaker4Name = "",
    speaker4Title = "",
    speaker4Img = "",
  } = $props();
</script>

<div class="audio-block-container">
  {#if title}
    <div class="audio-title">{title}</div>
  {/if}

  <figure class="audio-block">
    <audio
      controls
      src={audioSrc}
      aria-label={title ? `Audio: ${title}` : "Audio player"}
    ></audio>
    {#if captionHtml}
      <figcaption class="audio-caption">
        {@html captionHtml}
      </figcaption>
    {/if}
  </figure>

  <!-- Speaker 1 -->
  {#if speaker1Name || speaker1Title || speaker1Img}
    <div class="audio-people-container">
      {#if speaker1Img}
        <img
          class="audio-speaker-image"
          src={speaker1Img}
          alt={speaker1Name ? `${speaker1Name} portrait` : ""}
          loading="lazy"
          decoding="async"
        />
      {/if}
      <div class="audio-speaker-container">
        {#if speaker1Name}<div class="audio-speaker-name">
            {speaker1Name}
          </div>{/if}
        {#if speaker1Title}<div class="audio-speaker-title">
            {speaker1Title}
          </div>{/if}
      </div>
    </div>
  {/if}

  <!-- Speaker 2 -->
  {#if speaker2Name || speaker2Title || speaker2Img}
    <div class="audio-people-container">
      {#if speaker2Img}
        <img
          class="audio-speaker-image"
          src={speaker2Img}
          alt={speaker2Name ? `${speaker2Name} portrait` : ""}
          loading="lazy"
          decoding="async"
        />
      {/if}
      <div class="audio-speaker-container">
        {#if speaker2Name}<div class="audio-speaker-name">
            {speaker2Name}
          </div>{/if}
        {#if speaker2Title}<div class="audio-speaker-title">
            {speaker2Title}
          </div>{/if}
      </div>
    </div>
  {/if}

  <!-- Speaker 3 -->
  {#if speaker3Name || speaker3Title || speaker3Img}
    <div class="audio-people-container">
      {#if speaker3Img}
        <img
          class="audio-speaker-image"
          src={speaker3Img}
          alt={speaker3Name ? `${speaker3Name} portrait` : ""}
          loading="lazy"
          decoding="async"
        />
      {/if}
      <div class="audio-speaker-container">
        {#if speaker3Name}<div class="audio-speaker-name">
            {speaker3Name}
          </div>{/if}
        {#if speaker3Title}<div class="audio-speaker-title">
            {speaker3Title}
          </div>{/if}
      </div>
    </div>
  {/if}

  <!-- Speaker 4 -->
  {#if speaker4Name || speaker4Title || speaker4Img}
    <div class="audio-people-container">
      {#if speaker4Img}
        <img
          class="audio-speaker-image"
          src={speaker4Img}
          alt={speaker4Name ? `${speaker4Name} portrait` : ""}
          loading="lazy"
          decoding="async"
        />
      {/if}
      <div class="audio-speaker-container">
        {#if speaker4Name}<div class="audio-speaker-name">
            {speaker4Name}
          </div>{/if}
        {#if speaker4Title}<div class="audio-speaker-title">
            {speaker4Title}
          </div>{/if}
      </div>
    </div>
  {/if}
</div>

<style>
  :host {
    display: block;
  }

  .audio-block-container {
    margin-top: 0 !important;
    margin-bottom: 48px !important;
    margin-left: 40px;
    max-width: 350px;
    width: 50vw;
    clear: both;
  }

  .audio-title {
    font-family: canada-type-gibson, sans-serif;
    font-size: 18px;
    line-height: 20px;
    font-weight: 500;
    margin-bottom: 4px;
    display: block;
    color: #333;
  }

  .audio-block {
    width: 100%;
    margin: 0;
    padding: 0;
    text-align: left;
    display: block;
    font-size: 1.15em;
    color: #333;
    line-height: 1.25;
  }

  .audio-block audio {
    min-width: 300px;
    height: 54px;
    width: 100%;
  }

  .audio-caption {
    margin: 0;
    padding-top: 0 !important;
    margin-top: 0.5em;
    color: #555d66;
    font-size: 13px;
    display: block !important;
    font-family: canada-type-gibson, sans-serif;
    line-height: 1.4 !important;
    text-align: left !important;
    max-width: 660px; /* fixed 66opx -> 660px */
    font-style: unset;
  }

  /* replace .audio-link rule with this */
  :global(.audio-caption a) {
    color: inherit;
    background-color: transparent;
    cursor: pointer;
    text-decoration: underline;
    font-size: 13px;
  }

  .audio-people-container {
    display: grid;
    grid-template-columns: 75px auto;
    grid-template-rows: auto;
    grid-column-gap: 1rem;
    grid-template-areas: "audioimg audioprofile";
    margin: 8px 0;
    color: #333;
    line-height: 1.25;
  }

  .audio-speaker-image {
    grid-area: audioimg;
    max-width: 100%;
    border-style: none;
    font-size: 1.15em;
    color: #333;
    line-height: 1.25;
  }

  .audio-speaker-container {
    grid-area: audioprofile;
    display: block;
    color: #333;
    font-family: "Gelasio", Georgia, "Times New Roman", Times, serif;
    line-height: 1.25;
  }

  .audio-speaker-name {
    padding-top: 8px;
    font-size: 1em;
    font-family: canada-type-gibson, sans-serif;
    line-height: 20px;
    margin-bottom: 4px;
    display: block;
    color: #333;
  }

  .audio-speaker-title {
    margin-bottom: 0;
    padding-top: 0 !important;
    font-family: canada-type-gibson, sans-serif;
    font-size: 0.8em;
    line-height: 1.25 !important;
    color: rgba(51, 51, 51, 0.75);
    display: block !important;
    text-align: left !important;
    max-width: 660px;
    font-style: unset;
    margin: 0;
    padding: 0;
    width: auto;
  }
</style>
