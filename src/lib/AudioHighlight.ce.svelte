<svelte:options
  customElement={{
    tag: "csis-audio-highlight",
    props: {
      audioSrc: { attribute: "audio-src", type: "String" },
      highlightColor: { attribute: "highlight-text-color", type: "String" },
      highlightBg: { attribute: "highlight-bg", type: "String" },
      playColor: { attribute: "play-color", type: "String" },
    },
  }}
/>

<script>
  let {
    audioSrc = "https://graphics.axios.com/2023-08-tanzania-school/audio/collin-clip-2.m4a",
    highlightColor = "#fcfcfc",
    highlightBg = "#092458",
    playColor = "#134fbe",
  } = $props();

  let isPlaying = $state(false);
  let hasAnimated = $state(false); // controls .animate

  let highlight;
  let playIcon;
  let pauseIcon;
  let myAudio;

  function pauseAudio() {
    myAudio.pause();
    playIcon.classList.remove("hide");
    pauseIcon.classList.add("hide");
    
    if (highlight) {
      highlight.style.animationPlayState = "paused";
    }

    isPlaying = false;
  }

  function playAudio() {
    myAudio.play();
    hasAnimated = true;
    if (highlight) {
      highlight.style.animationPlayState = "running";
    }
    playIcon.classList.add("hide");
    pauseIcon.classList.remove("hide");
    isPlaying = true;
  }

  function play() {
    isPlaying ? pauseAudio() : playAudio();

    console.log("click");
  }

  function handleAnimationEnd() {
    console.log("end");

    if (highlight) {
      highlight.style.animationPlayState = "paused";
    }

    // remove the .animate class so we go back to “solid” background
    hasAnimated = false;

    pauseIcon.classList.add("hide");
    playIcon.classList.remove("hide");
    isPlaying = false;
  }
</script>

<div id="container">
  <p id="audioParagraph">
    Ngujapeua said it’s “very important” for SWAPO to implement this style of
    party-state relations at the grassroots level. “We have to work hand in
    hand, the political party and the government.” The instructor
  </p>
  <span
    id="highlight"
    bind:this={highlight}
    class="highlight-span"
    class:animate={hasAnimated}
    onanimationend={handleAnimationEnd}
    style={`--highlight-text-color:${highlightColor}; --highlight-background:${highlightBg}; --play:${playColor};`}
  >
    <audio id="myAudio" bind:this={myAudio} src={audioSrc}></audio>

    <button type="button" onclick={play}>
      <span class="visually-hidden">Play</span>
      <svg
        aria-hidden="true"
        focusable="false"
        id="playIcon"
        bind:this={playIcon}
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          fill="#000"
          d="M12.131 6.025a1.126 1.126 0 0 1 0 1.95L3.69 12.849A1.126 1.126 0 0 1 2 11.874V2.126a1.126 1.126 0 0 1 1.689-.975l8.442 4.874Z"
        />
      </svg>
      <svg
        id="pauseIcon"
        bind:this={pauseIcon}
        class="hide"
        xmlns="http://www.w3.org/2000/svg"
        width="1em"
        height="1em"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          fill="#000"
          d="M6.103 11.45a1.55 1.55 0 0 1-3.103 0v-8.9a1.552 1.552 0 0 1 3.103 0v8.9ZM11.04 11.45a1.551 1.551 0 0 1-3.102 0v-8.9a1.551 1.551 0 0 1 3.101 0l.001 8.9Z"
        />
      </svg>
    </button>
    “told us we must solve our own problems. Instead of going to court, instead of
    using judiciaries, … he said we must solve our own problems internally.”
  </span>
</div>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,200..900;1,8..60,200..900&display=swap");

  #container {
    padding-top: 20px;
    max-width: 680px;
    margin: auto;
  }

  #myAudio {
    display: none;
  }

  #audioParagraph,
  #highlight {
    font-family: "Source Serif 4", serif;
    font-size: 1.125rem;
    line-height: 1.5;
  }

  #audioParagraph {
    color: #080808; /* main text color */
  }

  #highlight {
    color: var(--highlight-text-color); /* text being highlighted */
  }

  #playIcon,
  #pauseIcon {
    filter: invert(100%) sepia(100%) saturate(0%) hue-rotate(288deg)
      brightness(102%) contrast(102%);
  }

  .highlight-span {
    padding: 0 2px;
    background: var(
      --highlight-background
    ); /*highlight color before pushing play */
    border-radius: 4px;
  }

  #audioParagraph {
    display: inline;
  }

  .hide {
    display: none;
  }

  @keyframes highlighter {
    from {
      background-position: 0;
    }
    to {
      background-position: -100%;
    }
  }

  .animate {
    animation-name: highlighter;
    animation-duration: 14.12s;
    animation-direction: normal;
    animation-timing-function: linear;
    animation-play-state: paused;
    background-size: 200%;
    /*first color: default background*/
    /*second color: color of the moving highlight*/
    background-image: linear-gradient(
        to right,
        var(--highlight-background),
        50%,
        transparent 50%
      ),
      linear-gradient(var(--play) 50%, var(--play) 50%);
  }

  button {
    display: inline-flex;
    align-items: center;
    border: 0;
    padding: 4px 0 0 0;
    background: transparent;
    font-size: 1em;
    line-height: 1.5;
    vertical-align: top;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
</style>
