<svelte:options
  customElement={{
    tag: "csis-author-grid"
  }}
/>

<style>
  :host {
    display: block;
  }

  /* NOTES:
    - In the "description" sections -- update the font family as needed. If
    empty or commented out, it will inherit the default from Shorthand.
  */

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
  <!-- card 1 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://i.natgeofe.com/n/548467d8-c5f1-4551-9f58-6817a8d2c45e/NationalGeographic_2572187_square.jpg"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>

  <!-- card 2 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKr5wT7rfkjkGvNeqgXjBmarC5ZNoZs-H2uMpML8O7Q4F9W-IlUQibBT6IPqyvX45NOgw&usqp=CAU"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>

  <!-- card 3 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>

  <!-- card 4 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://images.unsplash.com/photo-1574158622682-e40e69881006?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>

  <!-- card 5 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://images.unsplash.com/photo-1597838816882-4435b1977fbe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2049&q=80"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>

  <!-- card 6 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://images.unsplash.com/photo-1596854307809-6e754c522f95?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>

  <!-- card 7 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://images.unsplash.com/photo-1611856950845-c82ee9a80c55?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2055&q=80"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>

  <!-- card 8 -->
  <div class="card">
    <div class="image-container">
      <a
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
      >
        <img
          src="https://images.unsplash.com/photo-1565560681175-99ae21e26ce1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2080&q=80"
          alt="Author Headshot"
        />
      </a>
    </div>
    <div class="content">
      <a
        class="name"
        href="https://www.csis.org/programs/about-us/leadership-and-staff/staff"
        >FirstName LastName</a
      >
      <br />
      <p class="description">Author Title</p>
    </div>
  </div>
</div>
