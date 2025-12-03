<script>
  let { container, rightTitle, btnText } = $props();
  let right;
</script>

<div
  class="split right"
  bind:this={right}
  on:mouseenter={() => container?.classList.add("hover-right")}
  on:mouseleave={() => container?.classList.remove("hover-right")}
>
  <h1>{rightTitle}</h1>
  <!-- <p>
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae recusandae
    cumque quam fugiat accusantium deleniti minima earum, aliquam blanditiis
    quibusdam reprehenderit necessitatibus consequatur ea fugit autem ab
    sapiente atque! Quam.
  </p> -->
  <a href="#" class="button">{btnText}</a>
</div>
