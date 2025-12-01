<script>
  // import { onMount } from "svelte"
  let { container, leftTitle } = $props();
  let left;

  // $inspect( container )
  // onMount(() => {
  //   left = document.querySelector(".left")

  //   left.addEventListener("mouseenter", () => {
  //     container.classList.add("hover-left")
  //   })

  //   left.addEventListener("mouseleave", () => {
  //     container.classList.remove("hover-left")
  //   })
  // })
</script>

<div
  class="split left"
  bind:this={left}
  on:mouseenter={() => container?.classList.add("hover-left")}
  on:mouseleave={() => container?.classList.remove("hover-left")}
>
  <h1>{leftTitle}</h1>
  <!-- <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae recusandae
    cumque quam fugiat accusantium deleniti minima earum, aliquam blanditiis
    quibusdam reprehenderit necessitatibus consequatur ea fugit autem ab
    sapiente atque! Quam.
  </p> -->
  <a href="#" class="button">Read More</a>
</div>
