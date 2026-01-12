<script>
  let { container, rightTitle, btnText, btnRightLink, rightTarget } = $props();
  let right;
</script>

<div
  class="split right"
  bind:this={right}
  onmouseenter={() => container?.classList.add("hover-right")}
  onmouseleave={() => container?.classList.remove("hover-right")}
  role="presentation"
>
  <h1>{rightTitle}</h1>
  <a href={btnRightLink} target={rightTarget} class="button">{btnText}</a>
</div>
