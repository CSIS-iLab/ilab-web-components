<svelte:options
  customElement={{
    tag: "csis-test",
    props: {
      bgImage: { attribute: "bg-image", type: "String" },
      backgroundImageAlt: { attribute: "background-image-alt", type: "String" },
    },
  }}
/>

<script>
    let { bgImage = "", backgroundImageAlt = "" } = $props()
</script>
<div>
  <h1>hola</h1>
</div>
