<script>
  import Demo from './Demo.svelte';
  import sections from '../meta';
</script>

<div class="container">
  <header>
    <h1>Marcelle - Examples & Demos</h1>
  </header>
  <main>
    <div class="privacy">
      <strong>Privacy Notice:</strong> Cookies are necessary to run these demos.
      In these demos data is stored in your web browser. None of your input will
      be transfered to a remote server.
    </div>
    {#each sections as { title, description, demos }}
      <section>
        <h2>{title}</h2>
        <!-- <p>{description}</p> -->

        <div class="demo-container">
          {#each demos as demo}
            <Demo {demo} />
          {/each}
        </div>
      </section>
    {/each}
  </main>
  <footer>
    <a href="https://marcelle.dev">Back to marcelle.dev</a>
    © 2020 Marcelle Pirates Crew
  </footer>
</div>

<style>
  :global(html),
  :global(body) {
    font-family: 'Poppins', sans-serif;
    box-sizing: border-box;
    font-weight: 300;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  header {
    margin-top: 2rem;
  }

  .container {
    max-width: 100%;
    width: 940px;
    margin: auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 100vh;
  }

  section {
    background-color: white;
    border-radius: 0.5rem;
    padding: 0.5rem;
  }

  h2 {
    margin: 1rem 4rem;
    padding: 12px;
    font-size: 1.6rem;
    font-weight: 500;
    color: white;
    color: #3d405b;
    border-bottom: 4px solid #3d405b;
  }

  .demo-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  p {
    text-align: left;
    padding: 1rem 0;
    margin: 0 4rem;
  }

  @media (max-width: 560px) {
    .demo-container {
      grid-template-columns: 1fr;
    }
  }

  .privacy {
    text-align: left;
    color: lightslategray;
    padding: 1rem 0;
    margin: 0 4rem;
    border-radius: 4px;
  }

  footer {
    margin-top: 1rem;
    padding: 1rem;
    text-align: right;
    border-top: 1px solid rgb(237, 242, 247);
    color: #6a8bad;
    display: flex;
    justify-content: space-between;
  }
</style>
