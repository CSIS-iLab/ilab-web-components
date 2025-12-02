<!-- Card.svelte -->
<script>
  let { src = "", alt = "" } = $props();
</script>

<li>
  <img {src} {alt} />
</li>
