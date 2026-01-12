<svelte:options
  customElement={{
    tag: "csis-split-landing",
    props: {
      leftTitle: { attribute: "left-title", type: "String" },
      btnLeftLink: { attribute: "btn-left-link", type: "String" },
      leftTarget: { attribute: "left-target", type: "String" },
      bgImageLeft: { attribute: "bg-image-left", type: "String" },
      btnBgColorLeft: { attribute: "btn-bg-color-left", type: "String" },
      btnHoverBgColorLeft: {
        attribute: "btn-hover-bg-color-left",
        type: "String",
      },
      rightTitle: { attribute: "right-title", type: "String" },
      btnRightLink: { attribute: "btn-right-link", type: "String" },
      rightTarget: { attribute: "right-target", type: "String" },
      bgImageRight: { attribute: "bg-image-right", type: "String" },
      btnBgColorRight: { attribute: "btn-bg-color-right", type: "String" },
      btnHoverBgColorRight: {
        attribute: "btn-hover-bg-color-right",
        type: "String",
      },

      btnBorderColor: { attribute: "btn-border-color", type: "String" },
      btnHoverBorderColor: {
        attribute: "btn-hover-border-color",
        type: "String",
      },
      btnText: { attribute: "btn-text", type: "String" },
    },
  }}
/>

<script>
  import Left from "./Left.svelte";
  import Right from "./Right.svelte";
  let {
    bgImageLeft = "",
    leftTitle = "left title",
    btnLeftLink = "#top",
    leftTarget = "_self",
    btnBgColorLeft = "black",
    btnHoverBgColorLeft = "gray",
    bgImageRight = "",
    rightTitle = "right title",
    btnRightLink = "#top",
    rightTarget = "_self",
    btnBgColorRight = "black",
    btnHoverBgColorRight = "gray",

    btnBorderColor = "red",
    btnHoverBorderColor = "blue",
    btnText = "Read More",
  } = $props();

  let container = $state();
</script>

<h1>hola</h1>
<div
  class="container"
  bind:this={container}
  style={`
    --bg-image-left: url("${bgImageLeft}");
    --btn-bg-color-left: ${btnBgColorLeft};
    --btn-hover-bg-color-left: ${btnHoverBgColorLeft};
    --bg-image-right: url("${bgImageRight}");
    --btn-bg-color-right: ${btnBgColorRight};
    --btn-hover-bg-color-right: ${btnHoverBgColorRight};
    --btn-border-color: ${btnBorderColor};
    --btn-hover-border-color: ${btnHoverBorderColor};
  `}
>
  <!-- container will be defined once this renders -->
  <Left {container} {leftTitle} {btnText} {btnLeftLink} {leftTarget} />
  <Right {container} {rightTitle} {btnText} {btnRightLink} {rightTarget} />
</div>

<style>
  :host {
    display: block;
    font-family: var(--ab-font, "IBM Plex Sans", system-ui, sans-serif);
    color: var(--ab-text, #fffefa);
    min-height: 100vh;
    --container-bg-color: #333;
    --base-color: rgb(195 195 195 / 0.75);
    --left-bg-color: rgba(223, 39, 39, 0.7);
    --left-button-hover-color: rgba(161, 11, 11, 0.3);
    --right-bg-color: rgba(43, 43, 43, 0.8);
    --right-button-hover-color: rgba(92, 92, 92, 0.3);
    --hover-width: 75%;
    --other-width: 25%;
    --speed: 1000ms;
  }
  :global {
    html,
    body {
      padding: 0;
      margin: 0;
      font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
      width: 100%;
      height: 100%;
      overflow-x: hidden;
    }

    h1 {
      font-size: 4rem;
      color: #fff;
      position: absolute;
      left: 50%;
      top: 20%;
      transform: translateX(-50%);
      white-space: nowrap;
    }

    .button {
      display: block;
      position: absolute;
      left: 50%;
      top: 40%;
      height: 2.5rem;
      padding-top: 1.3rem;
      width: 15rem;
      text-align: center;
      color: #fff;
      border: #fff solid 0.2rem;
      font-size: 1rem;
      font-weight: bold;
      text-transform: uppercase;
      text-decoration: none;
      transform: translateX(-50%);
    }

    @media (max-width: 800px) {
      h1 {
        font-size: 2rem;
      }

      .button {
        width: 12rem;
      }
    }

    @media (max-height: 700px) {
      .button {
        top: 70%;
      }
    }

    .split.left .button {
      background-color: var(--btn-bg-color-left, --base-color);
      border-color: var(--btn-border-color, --left-btn-border-color);
    }

    .split.right .button {
      background-color: var(--btn-bg-color-right, --base-color);
      border-color: var(--btn-border-color, --right-btn-border-color);
    }

    .split.left .button:hover {
      background-color: var(--btn-hover-bg-color-left);
      border-color: var(--btn-hover-border-color, --left-button-hover-color);
    }

    .split.right .button:hover {
      background-color: var(--btn-hover-bg-color-right);
      border-color: var(--btn-hover-border-color, --right-button-hover-color);
    }

    .container {
      position: relative;
      width: 100%;
      height: 100vh;
      background: var(--container-bg-color);
    }

    .split {
      position: absolute;
      width: 50%;
      height: 100%;
      overflow: hidden;
    }

    .split.left {
      left: 0;
      background: var(--bg-image-left) center center no-repeat;
      background-size: cover;
    }

    .split.left:before {
      position: absolute;
      content: "";
      width: 100%;
      height: 100%;
      /*background: var(--left-bg-color);*/
    }

    .split.right {
      right: 0;
      background: var(--bg-image-right) center center no-repeat;
      background-size: cover;
    }

    .split.right:before {
      position: absolute;
      content: "";
      width: 100%;
      height: 100%;
      /*background: var(--right-bg-color);*/
    }

    .split.left,
    .split.right,
    .split.right:before,
    .split.left:before {
      transition: var(--speed) all ease-in-out;
    }

    .hover-left .left {
      width: var(--hover-width);
    }

    .hover-left .right {
      width: var(--other-width);
    }

    .hover-left .right:before {
      z-index: 2;
    }

    .hover-right .right {
      width: var(--hover-width);
    }

    .hover-right .left {
      width: var(--other-width);
    }

    .hover-right .left:before {
      z-index: 2;
    }
  }
</style>
