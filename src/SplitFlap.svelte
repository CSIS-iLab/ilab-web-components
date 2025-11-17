<svelte:options
  customElement={{
    tag: "csis-splitflap",
    props: {
      text: { attribute: "text", type: "String" },
    },
  }}
/>

<script>
  import { onMount } from "svelte";
  import gsap from "https://cdn.skypack.dev/gsap@3.12.0";

  let { text = "CSIS" } = $props();

  let board; // Svelte binds DOM node here
  // const board = document.querySelector(".board");

  // use onMount to call addLine after component has
  // been mounted and `board` is bound.
  onMount(() => {
    // make sure board is empty if this somehow runs more than once
    if (board) board.innerHTML = "";

    addLine({
      text,
      pad: 1,
      alignment: "left",
    });
    addLine({
      text: "new widget",
      pad: 2,
      alignment: "right",
    });
    addLine({
      text: "just",
      pad: 3,
      alignment: "right",
    });
    addLine({
      text: "dropped",
      pad: 4,
      alignment: "right",
      color: "hsl(44,82%,49%)",
    });
  });

  gsap.defaults({
    duration: 1,
    ease: "none",
  });
  const CHARACTERS = "abcdefghijklmnopqrstuvwxyz!";

  class FlipSlot {
    constructor(options = {}) {
      const {
        characters = CHARACTERS,
        color = "canvasText",
        pad = 0,
      } = options;
      this.characters = Array.from(` ${characters} `);
      this.colorSet = color;
      this.pad = pad;
      this.element = this.create();
      this.generateTimeline();
    }
    set chars(value) {
      this.characters = Array.from(` ${value} `);
      this.generateTimeline();
    }
    set color(value) {
      this.element?.style.setProperty("--color", value);
    }
    create() {
      const element = Object.assign(document.createElement("div"), {
        className: "flip",
        style: `--color: ${this.colorSet}`,
        innerHTML: `
              <!-- fold top -->
              <div></div>
              <!-- fold bottom -->
              <div></div>
              <!-- unfold top -->
              <div></div>
              <!-- unfold bottom -->
              <div></div>
            `,
      });
      return element;
    }
    flip(character, delay = 0) {
      const { characters: chars, pad, timeline, scrubber } = this;
      const currentIndex = chars.indexOf(chars[timeline.totalTime()]);
      const desiredIndex =
        chars.indexOf(character) !== -1 ? chars.indexOf(character) : 0;
      const shift =
        currentIndex > desiredIndex
          ? chars.length - 1 - currentIndex + desiredIndex
          : desiredIndex - currentIndex;
      const padding =
        currentIndex === desiredIndex ? 0 : pad * (chars.length - 1);

      /* animate the time position of the scrubber */
      gsap.to(scrubber, {
        delay,
        totalTime: `+=${shift + padding}`,
        ease: "power1.out",
        duration: (shift + padding) * gsap.utils.random(0.02, 0.06),
      });
    }

    generateTimeline() {
      const { timeline: currentTimeline, scrubber, element } = this;
      if (currentTimeline) currentTimeline.kill();
      if (scrubber) this.scrubber.kill();

      const [unfoldTop, unfoldBottom, foldTop, foldBottom] = Array.from(
        // element.querySelectorAll("& > div")
        // ^ update syntax to below, tell Svelte
        // you mean direct children of this element
        element.querySelectorAll(":scope > div")
      );
      const chars = this.characters;

      gsap.set([foldTop, unfoldBottom], { clearProps: "all" });

      // unfoldTop.innerText = unfoldBottom.innerText = chars[1];
      // foldTop.innerText = foldBottom.innerText = chars[0];
      // ^ stop chaining and change to below
      unfoldTop.innerText = chars[1];
      unfoldBottom.innerText = chars[1];
      foldTop.innerText = chars[0];
      foldBottom.innerText = chars[0];

      // loop over characters; padding list with space allows
      // returning a blank flap
      const timeline = gsap
        .timeline({
          paused: true,
          // account for the extra space
          repeat: chars.length - 2,
          onRepeat: () => {
            const index = Math.floor(
              timeline.totalTime() / timeline.duration()
            );
            const next = chars[index % chars.length];
            const current = chars[(index + 1) % chars.length];
            // unfoldTop.innerText = unfoldBottom.innerText = current;
            // foldTop.innerText = foldBottom.innerText = next;
            unfoldTop.innerText = current;
            unfoldBottom.innerText = current;
            foldTop.innerText = next;
            foldBottom.innerText = next;
          },
        })
        .fromTo(
          unfoldBottom,
          { rotateX: 180 },
          {
            rotateX: 0,
            duration: 1,
          },
          0
        )
        .fromTo(
          unfoldTop,
          { filter: "brightness(0)" },
          {
            filter: "brightness(1)",
            duration: 1,
          },
          0
        )
        .fromTo(
          foldTop,
          { rotateX: 0 },
          {
            duration: 1,
            rotateX: -180,
          },
          0
        )
        .fromTo(
          foldBottom,
          { filter: "brightness(1)" },
          {
            duration: 1,
            filter: "brightness(0)",
          },
          0
        );

      /* create meta TL and give it infinite iterations. Use
          modulo to work out the correct character to show*/
      const duration = timeline.totalDuration();
      this.scrubber = gsap.to(timeline, {
        totalTime: duration,
        repeat: -1,
        paused: true,
        duration: duration,
        ease: "none",
      });
      this.scrubber.time(timeline.totalDuration());
      this.timeline = timeline;
    }
  }

  class FlipLine {
    constructor(options = {}) {
      const { color, length = 10, pad = 0 } = options;
      this.colorSet = color;
      this.length = length;
      this.padding = pad;
      this.options = options;

      this.setup();
    }
    setup() {
      const { colorSet, length, padding } = this;
      if (this.element) {
        this.element.innerHTML = "";
      } else {
        this.element = Object.assign(document.createElement("div"), {
          className: "flip-line",
        });
      }
      this.flips = [];
      for (let i = 0; i < length; i++) {
        const newSlot = new FlipSlot({
          pad: padding,
          characters: CHARACTERS,
          color: colorSet,
        });
        this.element.appendChild(newSlot.element);
        this.flips.push(newSlot);
      }
    }
    set lineLength(value) {
      this.length = value;
      this.setup();
    }
    set pad(value) {
      const { flips } = this;
      if (flips) {
        for (let i = 0; i < flips.length; i++) flips[i].pad = value;
      }
    }
    set color(value) {
      const { flips } = this;
      this.colorSet = value;
      if (flips) {
        for (let i = 0; i < flips.length; i++) flips[i].color = value;
      }
    }
    run(update) {
      const letters = Array.from(update.padEnd(this.length, " "));
      for (let i = 0; i < Math.min(letters.length, this.length); i++) {
        this.flips[i]?.flip(letters[i], i / 10);
      }
    }
  }

  const addLine = ({
    text = "",
    pad = 1,
    color = "hsl(0,0%,90%)",
    alignment = "left",
  } = {}) => {
    const lineConfig = {
      text,
      length: 10,
      pad,
      color: color,
      alignment,
    };

    const newLine = new FlipLine({
      length: lineConfig.length, // NOTE: using length here
      color: color,
      pad,
    });
    board.appendChild(newLine.element);

    newLine.run(
      lineConfig.alignment === "right"
        ? lineConfig.text.toLowerCase().padStart(lineConfig.length, " ")
        : lineConfig.text.toLowerCase()
    );
  };
</script>

<!--use bind: to tell DOM node to attach to board variable-->
<div class="board" bind:this={board}></div>

<style>
  @import url("https://unpkg.com/normalize.css") layer(normalize);

  @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:ital,wght@0,100..700;1,100..700&display=swap");

  @layer normalize, base, demo, flip;

  @layer flip {
    :global(.flip > div:nth-of-type(2)) {
      z-index: 2;
      transform: rotateX(-180deg);
      backface-visibility: hidden;
    }
    :global(.flip div:nth-of-type(3)) {
      z-index: 3;
      backface-visibility: hidden;
    }
  }

  @layer demo {
    /* body {
      align-content: center;
      gap: 2rem;
    } */
    .board {
      display: flex;
      gap: 0.5ch;
      flex-direction: column;
      text-transform: uppercase;
      font-family: "Roboto Mono", monospace;
      padding: 6px;
      background: light-dark(hsl(0 0% 40%), hsl(0 0% 0%));
    }
    :global(.flip-line) {
      display: flex;
      gap: 0.5ch;
    }
    :global(.flip) {
      --font-level: 8;
      font-size: 2.5rem;
      color: var(--color, canvasText);
      width: 1.5ch;
      line-height: 1.2;
      display: inline-block;
      height: 1lh;
      text-align: center;
      position: relative;
      transform-style: preserve-3d;
      perspective: calc(var(--perspective) * 1em);
    }

    :global(.flip::before),
    :global(.flip::after) {
      content: "";
      position: absolute;
      width: calc(10% - 0.05em);
      height: calc(20% - 0.05em);
      background: color-mix(in oklch, canvas, canvasText 15%);
      top: 50%;
      translate: 0 -50%;
    }
    :global(.flip::before) {
      left: 0;
    }
    :global(.flip::after) {
      right: 0;
    }
    :global(.flip .flip-holder) {
      position: absolute;
      inset: 0;
      transform-style: preserve-3d;
    }

    :global(.flip div) {
      position: absolute;
      transform-style: preserve-3d;
      overflow: hidden;
      /* border-radius: 6px; */
      inset: 0;
      background: radial-gradient(
          100% 100% at 50% 100%,
          light-dark(hsl(0 0% 88% / 0.2), hsl(0 0% 60% / 0.2)),
          #0000
        ),
        light-dark(hsl(0 0% 92%), hsl(0 0% 15%));
    }

    /*Using clip-path, you can clip the children into the right shape. A small trick here is to use pseudo-elements of the container for the axle ends.*/
    :global(.flip div:nth-of-type(odd)) {
      clip-path: polygon(
        0 0,
        100% 0,
        100% 40%,
        calc(90% + 0.025em) 40%,
        calc(90% + 0.025em) 48%,
        calc(10% - 0.025em) 48%,
        calc(10% - 0.025em) 40%,
        0 40%
      );
    }
    :global(.flip div:nth-of-type(even)) {
      clip-path: polygon(
        0 60%,
        calc(10% - 0.025em) 60%,
        calc(10% - 0.025em) 52%,
        calc(90% + 0.025em) 52%,
        calc(90% + 0.025em) 60%,
        100% 60%,
        100% 100%,
        0 100%
      );
    }
    /*-- ------------------------ - ------------------------ --*/
  }

  @layer base {
    :root {
      --perspective: 1;
    }

    *,
    *:after,
    *:before {
      box-sizing: border-box;
    }

    :host {
      background: light-dark(#fff, #000);
      display: grid;
      place-items: center;
      min-height: 100vh;
      width: 100vw;
      font-family: "SF Pro Text", "SF Pro Icons", "AOS Icons", "Helvetica Neue",
        Helvetica, Arial, sans-serif, system-ui;
      color-scheme: dark;
    }

    :host::before {
      --size: 45px;
      --line: color-mix(in lch, canvasText, transparent 70%);
      content: "";
      height: 100vh;
      width: 100vw;
      position: fixed;
      background:
        linear-gradient(90deg, var(--line) 1px, transparent 1px var(--size)) 50%
          50% / var(--size) var(--size),
        linear-gradient(var(--line) 1px, transparent 1px var(--size)) 50% 50% /
          var(--size) var(--size);
      mask: linear-gradient(-20deg, transparent 50%, white);
      top: 0;
      transform-style: flat;
      pointer-events: none;
      z-index: 1;
    }
  }
</style>
