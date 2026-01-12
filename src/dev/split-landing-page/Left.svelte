<script>
  let { container, leftTitle, btnText, btnLeftLink, leftTarget } = $props();
  let left;
</script>

<div
  class="split left"
  bind:this={left}
  on:mouseenter={() => container?.classList.add("hover-left")}
  on:mouseleave={() => container?.classList.remove("hover-left")}
>
  <h1>{leftTitle}</h1>
  <a href={btnLeftLink} target={leftTarget} class="button">{btnText}</a>
</div>
