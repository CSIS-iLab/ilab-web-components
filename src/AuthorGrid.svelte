<svelte:options
  customElement={{
    tag: "csis-author-grid",
    props: {
      count: { attribute: "count", type: "Number" },

      author1Name: { attribute: "author-1-name", type: "String" },
      author1Title: { attribute: "author-1-title", type: "String" },
      author1Image: { attribute: "author-1-image", type: "String" },
      author1Url: { attribute: "author-1-url", type: "String" },

      author2Name: { attribute: "author-2-name", type: "String" },
      author2Title: { attribute: "author-2-title", type: "String" },
      author2Image: { attribute: "author-2-image", type: "String" },
      author2Url: { attribute: "author-2-url", type: "String" },

      author3Name: { attribute: "author-3-name", type: "String" },
      author3Title: { attribute: "author-3-title", type: "String" },
      author3Image: { attribute: "author-3-image", type: "String" },
      author3Url: { attribute: "author-3-url", type: "String" },

      author4Name: { attribute: "author-4-name", type: "String" },
      author4Title: { attribute: "author-4-title", type: "String" },
      author4Image: { attribute: "author-4-image", type: "String" },
      author4Url: { attribute: "author-4-url", type: "String" },

      author5Name: { attribute: "author-5-name", type: "String" },
      author5Title: { attribute: "author-5-title", type: "String" },
      author5Image: { attribute: "author-5-image", type: "String" },
      author5Url: { attribute: "author-5-url", type: "String" },

      author6Name: { attribute: "author-6-name", type: "String" },
      author6Title: { attribute: "author-6-title", type: "String" },
      author6Image: { attribute: "author-6-image", type: "String" },
      author6Url: { attribute: "author-6-url", type: "String" },

      author7Name: { attribute: "author-7-name", type: "String" },
      author7Title: { attribute: "author-7-title", type: "String" },
      author7Image: { attribute: "author-7-image", type: "String" },
      author7Url: { attribute: "author-7-url", type: "String" },

      author8Name: { attribute: "author-8-name", type: "String" },
      author8Title: { attribute: "author-8-title", type: "String" },
      author8Image: { attribute: "author-8-image", type: "String" },
      author8Url: { attribute: "author-8-url", type: "String" }
    }
  }}
/>

<script>
  let {
    count = 4,

    author1Name = "FirstName LastName",
    author1Title = "Author Title",
    author1Image = "https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg",
    author1Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff",

    author2Name = "FirstName LastName",
    author2Title = "Author Title",
    author2Image = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKr5wT7rfkjkGvNeqgXjBmarC5ZNoZs-H2uMpML8O7Q4F9W-IlUQibBT6IPqyvX45NOgw&usqp=CAU",
    author2Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff",

    author3Name = "FirstName LastName",
    author3Title = "Author Title",
    author3Image = "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?auto=format&fit=crop&w=2080&q=80",
    author3Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff",

    author4Name = "FirstName LastName",
    author4Title = "Author Title",
    author4Image = "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=2080&q=80",
    author4Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff",

    author5Name = "FirstName LastName",
    author5Title = "Author Title",
    author5Image = "https://images.unsplash.com/photo-1597838816882-4435b1977fbe?auto=format&fit=crop&w=2049&q=80",
    author5Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff",

    author6Name = "FirstName LastName",
    author6Title = "Author Title",
    author6Image = "https://images.unsplash.com/photo-1596854307809-6e754c522f95?auto=format&fit=crop&w=2080&q=80",
    author6Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff",

    author7Name = "FirstName LastName",
    author7Title = "Author Title",
    author7Image = "https://images.unsplash.com/photo-1611856950845-c82ee9a80c55?auto=format&fit=crop&w=2055&q=80",
    author7Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff",

    author8Name = "FirstName LastName",
    author8Title = "Author Title",
    author8Image = "https://images.unsplash.com/photo-1565560681175-99ae21e26ce1?auto=format&fit=crop&w=2080&q=80",
    author8Url = "https://www.csis.org/programs/about-us/leadership-and-staff/staff"
  } = $props();

  const maxAuthors = 8;

  // Svelte 5-style derived value (no $: reactive statement)
  const authors = $derived([
    { name: author1Name, title: author1Title, image: author1Image, url: author1Url },
    { name: author2Name, title: author2Title, image: author2Image, url: author2Url },
    { name: author3Name, title: author3Title, image: author3Image, url: author3Url },
    { name: author4Name, title: author4Title, image: author4Image, url: author4Url },
    { name: author5Name, title: author5Title, image: author5Image, url: author5Url },
    { name: author6Name, title: author6Title, image: author6Image, url: author6Url },
    { name: author7Name, title: author7Title, image: author7Image, url: author7Url },
    { name: author8Name, title: author8Title, image: author8Image, url: author8Url }
  ].slice(
    0,
    Math.min(Number(count ?? maxAuthors) || maxAuthors, maxAuthors)
  ));
</script>

<style>
  :host {
    display: block;
  }

  .card {
    color: white;
    padding: 1rem;
  }

  .cards {
    max-width: 1300px;
    margin: 0 auto;
    display: grid;
    gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    word-wrap: break-word;
  }

  .card:hover a {
    border-color: #3dd5ff;
  }

  .card:hover .image-container {
    background-color: #3dd5ff;
  }

  .image-container {
    margin-bottom: 1em;
    background: #0054a4;
    max-width: 224px;
    transition: 0.3s;
  }

  .card img {
    width: 100%;
    max-height: 224px;
    display: block;
    margin-bottom: -1em;
    position: relative;
    right: -0.5em;
    top: -0.5em;
  }

  .name {
    display: inline;
    font-size: 1em;
    /*font-family: "synthese", san-serif;*/
    font-weight: 300;
    color: #0054a4;
    text-decoration: none;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    line-height: 1.3;
    transition: color 0.3s linear;
    border-bottom: 2px solid transparent;
  }

  .content {
    margin-top: 30px;
  }

  .description {
    display: inline;
    color: black;
    opacity: 65%;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    font-size: 0.8em;
    line-height: 1.3;
    /*font-family: "synthese", san-serif;*/
    font-weight: 400;
  }
</style>

<div class="cards">
  {#each authors as author}
    <div class="card">
      <div class="image-container">
        <a href={author.url}>
          <img
            src={author.image}
            alt={author.name ? `${author.name} headshot` : "Author headshot"}
          />
        </a>
      </div>
      <div class="content">
        <a class="name" href={author.url}>
          {author.name}
        </a>
        <br />
        <p class="description">
          {author.title}
        </p>
      </div>
    </div>
  {/each}
</div>
