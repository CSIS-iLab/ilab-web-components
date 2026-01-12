<script>
  let { container, leftTitle, btnText, btnLeftLink, leftTarget } = $props();
  let left;
</script>

<div
  class="split left"
  bind:this={left}
  onmouseenter={() => container?.classList.add("hover-left")}
  onmouseleave={() => container?.classList.remove("hover-left")}
  role="presentation"
>
  <h1>{leftTitle}</h1>
  <a href={btnLeftLink} target={leftTarget} class="button">{btnText}</a>
</div>
