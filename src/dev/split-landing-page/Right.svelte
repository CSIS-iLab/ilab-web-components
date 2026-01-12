<script>
  let { container, rightTitle, btnText, btnRightLink, rightTarget } = $props();
  let right;
</script>

<div
  class="split right"
  bind:this={right}
  on:mouseenter={() => container?.classList.add("hover-right")}
  on:mouseleave={() => container?.classList.remove("hover-right")}
>
  <h1>{rightTitle}</h1>
  <a href={btnRightLink} target={rightTarget} class="button">{btnText}</a>
</div>
