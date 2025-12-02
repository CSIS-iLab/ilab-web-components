<svelte:options
  customElement={{
    tag: "csis-infinity-scroll",
    props: {
      title: { attribute: "title", type: "String" },
      bgImage: { attribute: "bg-image", type: "String" },
      bgImageAlt: {
        attribute: "background-image-alt",
        type: "String",
      },
    },
  }}
/>

<script>
  import { onMount, onDestroy } from "svelte";
  import gsap from "gsap";
  import { ScrollTrigger } from "gsap/ScrollTrigger";

  gsap.registerPlugin(ScrollTrigger);

  let { title = "", bgImage = "", bgImageAlt = "" } = $props();

  // This will be the .gallery div
  let gallery;

  let trigger;
  let scrub;
  let seamlessLoop;

  onMount(() => {
    if (!gallery) return;

    const cards = gsap.utils.toArray(gallery.querySelectorAll(".cards li"));
    const images = gallery.querySelectorAll(".cards li img");
    const nextBtn = gallery.querySelector(".next");
    const prevBtn = gallery.querySelector(".prev");

    if (!cards.length) return;

    // fade in images
    gsap.to(images, { opacity: 1, delay: 0.1 });

    let iteration = 0;
    const spacing = 0.1;
    const snap = gsap.utils.snap(spacing);

    seamlessLoop = buildSeamlessLoop(cards, spacing);

    scrub = gsap.to(seamlessLoop, {
      totalTime: 0,
      duration: 0.5,
      ease: "power3",
      paused: true,
    });

    trigger = ScrollTrigger.create({
      start: 0,
      end: "+=3000",
      trigger: gallery,
      pin: gallery,
      onUpdate(self) {
        if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
          wrapForward(self);
        } else if (
          self.progress < 1e-5 &&
          self.direction < 0 &&
          !self.wrapping
        ) {
          wrapBackward(self);
        } else {
          scrub.vars.totalTime = snap(
            (iteration + self.progress) * seamlessLoop.duration(),
          );
          scrub.invalidate().restart();
          self.wrapping = false;
        }
      },
    });

    function wrapForward(st) {
      iteration++;
      st.wrapping = true;
      st.scroll(st.start + 1);
    }

    function wrapBackward(st) {
      iteration--;
      if (iteration < 0) {
        iteration = 9;
        seamlessLoop.totalTime(
          seamlessLoop.totalTime() + seamlessLoop.duration() * 10,
        );
        scrub.pause();
      }
      st.wrapping = true;
      st.scroll(st.end - 1);
    }

    function scrubTo(totalTime) {
      const loopDuration = seamlessLoop.duration();
      const progress = (totalTime - loopDuration * iteration) / loopDuration;

      if (progress > 1) {
        wrapForward(trigger);
      } else if (progress < 0) {
        wrapBackward(trigger);
      } else {
        trigger.scroll(
          trigger.start + progress * (trigger.end - trigger.start),
        );
      }
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () =>
        scrubTo(scrub.vars.totalTime + spacing),
      );
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () =>
        scrubTo(scrub.vars.totalTime - spacing),
      );
    }

    function buildSeamlessLoop(items, spacing) {
      const overlap = Math.ceil(1 / spacing);
      const startTime = items.length * spacing + 0.5;
      const loopTime = (items.length + overlap) * spacing + 1;

      const rawSequence = gsap.timeline({ paused: true });
      const seamlessLoop = gsap.timeline({
        paused: true,
        repeat: -1,
        onRepeat() {
          this._time === this._dur && (this._tTime += this._dur - 0.01);
        },
      });

      const l = items.length + overlap * 2;

      gsap.set(items, { xPercent: 400, opacity: 0, scale: 0 });

      for (let i = 0; i < l; i++) {
        const index = i % items.length;
        const item = items[index];
        const time = i * spacing;

        rawSequence
          .fromTo(
            item,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              zIndex: 100,
              duration: 0.5,
              yoyo: true,
              repeat: 1,
              ease: "power1.in",
              immediateRender: false,
            },
            time,
          )
          .fromTo(
            item,
            { xPercent: 400 },
            {
              xPercent: -400,
              duration: 1,
              ease: "none",
              immediateRender: false,
            },
            time,
          );

        if (i <= items.length) {
          seamlessLoop.add("label" + i, time);
        }
      }

      rawSequence.time(startTime);

      seamlessLoop
        .to(rawSequence, {
          time: loopTime,
          duration: loopTime - startTime,
          ease: "none",
        })
        .fromTo(
          rawSequence,
          { time: overlap * spacing + 1 },
          {
            time: startTime,
            duration: startTime - (overlap * spacing + 1),
            immediateRender: false,
            ease: "none",
          },
        );

      return seamlessLoop;
    }
  });

  onDestroy(() => {
    if (trigger) trigger.kill();
    if (scrub) scrub.kill();
    if (seamlessLoop) seamlessLoop.kill();
    // optional: nuke all ScrollTriggers if this is the only GSAP thing on the page
    ScrollTrigger.getAll().forEach((t) => t.kill());
  });
</script>

<!-- Root element we bind to for scoping -->
<div class="gallery" bind:this={gallery}>
  <ul class="cards">
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-1.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-2.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-3.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-4.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-5.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-1.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-2.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-3.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-4.png" alt="" />
    </li>
    <li>
      <img src="https://assets.codepen.io/16327/portrait-number-5.png" alt="" />
    </li>
  </ul>

  <div class="actions">
    <button class="prev">Prev</button>
    <button class="next">Next</button>
  </div>
</div>

<style>
  :host {
    display: block;
    min-height: 100vh;
  }

  * {
    box-sizing: border-box;
  }

  .gallery {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #111;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      sans-serif;
  }

  .cards {
    position: absolute;
    width: 14rem;
    height: 18rem;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .cards li {
    list-style: none;
    padding: 0;
    margin: 0;
    width: 14rem;
    height: 18rem;
    text-align: center;
    line-height: 18rem;
    font-size: 2rem;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 0.8rem;
  }

  .cards li img {
    max-width: 90%;
    opacity: 0;
  }

  .actions {
    position: absolute;
    bottom: 25px;
    left: 50%;
    transform: translateX(-50%);
  }

  button {
    display: inline-block;
    outline: none;
    padding: 12px 25px;
    background: #111;
    border: solid 2px #eee;
    color: #eee;
    border-radius: 99px;
    font-weight: 600;
    cursor: pointer;
    line-height: 18px;
    margin: 1rem;
  }

  button:hover {
    background: #eee;
    color: #111;
  }
</style>
