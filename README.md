# iLab Web Components

## Table of Contents
- [Project Overview](#project-overview)
- [Project Structure](#project-structure)
  - [Distro Files](#distro-files)
  - [`dev` and `lib`](#dev-and-lib)
  - [Build Entry Points and Naming Convention](#build-entry-points-and-naming-convention)
  - [`index.html`](#indexhtml)
  - [`package.json`](#packagejson)
  - [`svelte.config.js`](#svelteconfigjs)
  - [`vite.config.js`](#viteconfigjs)
- [Workflow Overview](#workflow-overview)
- [Detailed Workflow Instructions](#detailed-workflow-instructions)
  - [Setup](#setup)
  - [Local Dev](#local-dev)
  - [Test in Shorthand](#test-in-shorthand)
    - [Why the SHA?](#why-the-sha)
  - [Prep for your Pull Request](#prep-for-your-pull-request)
  - [Make a Pull Request](#make-a-pull-request)
  - [Reviewing a Pull Request](#reviewing-a-pull-request)
  - [Merge your PR and release an update](#merge-your-pr-and-release-an-update)
- [Brief Guidelines for Components](#brief-guidelines-for-components)

## Project Overview
This is a Svelte repository for reusable, framework-agnostic web components for use inside [Shorthand](https://shorthand.com/) and other CSIS digital projects. The components are [Svelte 5 custom elements](https://svelte.dev/docs/svelte/custom-elements). Each element compiles into an HTML tag that can be used in any page that allows custom HTML and JavaScript.

All production components are bundled into **one file**, `dist/widgets.js` which is tagged and released using [SemVer](https://semver.org/). In development, we use `dist/widgets-dev.js`. It is only built inside a development branch and never committed to `main`. 

To use the components, include `<script>` tag that loads the library from our CDN. We use [jsDelivr](https://www.jsdelivr.com/). This README outlines the required workflow for development and production relases, ensuring users always load the correct version and preventing experimental components from being included in production builds. 

This repository is <ins>**developer-facing only**</ins>. Non-developers should only interact with the code via the component tags included in production releases.

## Project Structure
```
/dist  ← compiled bundles (do **NOT** edit manually)
  widgets.js ← bundle and release on **main** only
  widgets-dev.js ← dev branches **only**
/src
  /lib ← production-ready components, in widgets.js
  /dev ← experimental components, in widgets-dev.js only
  dev-main.js ← dev entry point, imports lib && dev
  main.js ← production entry point, imports lib only
.gitignore
.index.html ← use for local dev, import main.js or dev-main.js
package.json
README.md
svelte.config.js
vite.config.js
```
### <ins>Distro Files</ins>
`widgets.js` and `widgets-dev.js` are the distribution files. `widgets.js` contains only what is inside the `src/lib` folder, and `widgets-dev.js` contains what is inside both `src/lib` and `src/dev`. 

### <ins>`dev` and `lib`</ins>
The separation between `dev` and `lib` serves both to keep things clean and as a safeguard. 
- The `dev` directory may contain any components that are under development/not ready for production. 
- `lib` should only contain what will be in the production library and released for use in Shorthand (or elsewhere). 

When a component is ready to be promoted from dev to production, it should be copied to `lib` and deleted from `dev`. Most frequently, `dev` components will stay in development branches and never be merged into `main`. 

But, a `dev` component may end up on `main`: 
- By accident - we forget to check the `dev` directory when reviewing a PR, focusing only on what's going to prod
- To experiment - we may want a component in `dev` to be made available for everyone to check out and iterate on/implement new features. 

The most important part: `lib` is production only. 

### <ins>Build Entry Points and Naming Convention</ins>
`main.js` and `dev-main.js` are set up to automatically import and register the components. 

They are configured to recognize `*.ce.svelte` as the component extension and will NOT import files with any other extension. This is to separate components from their helper files. 

Any helpers should be given the regular `*.svelte` extension (or whatever other appropriate extension).

### <ins>`index.html`</ins>
The `index.html` file is purely used for experimentation during development. This repo is not deployed, and `index.html` is not included in the production distro file.

`<script type="module" src="/src/dev-main.js"></script>` will load **all** components, both dev and production.

`<script type="module" src="/src/main.js"></script>` will load **only production** components.

Start the dev server and then inside `<body>`, use your new component and test changing the various attributes. A component should render cleanly and all attributes should function before it is tested inside Shorthand (and should work in Shorthand before merged into `main`).

### <ins>`package.json`</ins>
- name: same as repository
- `private: true` - package can't accidentally be published to npm
- `type:module` - treat `js` files as ES modules so we can use `import` and modern tooling
- scripts:
  - dev: `npm run dev` starts local server at `localhost:5173` and loads what's in `index.html` (`/src/main.js` or `/src/dev-main.js`); supports hot-reloading,
  - build: `npm run build` will build `dist/widgets.js` for **production**
  - build:dev-bundle: `npm run build:dev-bundle` will build `dist/widgets-dev.js` for **development use only**
  - preview: `npm run preview` will start a local static server you can use to test what's in `dist`. This will simulate what you'll get from the CDN. In `index.html`, replace the `<script>` importing from `src` with one that imports `/dist/widgets.js` or `/dist/widgets.js`.
- author: the iLab
- license: `UNLICENSED` indicates that the code is for CSIS use only
- description: "Svelte-based Web Components used across CSIS iDeas Lab projects".
- devDependencies: required only during development and build time
  - `@sveltejs/vite-plugin-svelte` - the official Svelte plugin for vite; handles compiling the components, enabling hot reload, optimization, generating CustomElements
  - `svelte` - the Svelte framework
  - `vite` - the development server and build tool
- dependencies: included in final bundle and available to components at runtime
  - [gsap](https://gsap.com/docs/v3/) - animation library. Note: a component must import GSAP for it to be included in the component's compiled output.

### <ins>`svelte.config.js`</ins>
This file configures how Svelte compiles components in this project. `customElement: true` tells svelte to compile every `.svelte` file (or `.ce.svelte`, in our case) as a Web Component instead of a normal Svelte component. This is what makes the repo function as a Web Component Library instead of a regular Svelte website/app project.

`import { vitePreprocess } from @sveltejs/vite-plugin-svelte';` maintains compatability with Svelte/Vite tooling and allows for future use of tools like SCSS and TypeScript.

### <ins>`vite.config.js`</ins>
This file controls how Vite builds the component library. It produces two different bundles: a production bundle, `widgets.js`, and a dev testing bundle, `widgets-dev.js`

- `mode` - lets the config switch based on build type
- `entry` - selects the appropriate js file based on mode
- `formats` - IIFE creates an immediately invoked function expression. We get a single, self-running JS file with no other exports, imports, or bundler required and has no dependencies on Vite or Svelte at runtime.
- `fileName` - the names of the bundles created
- `rollupOptions` - no code-splitting, everything in one file, Shorthand only needs one `<script>` tag

## Workflow Overview
Detailed instructions are below (and must be followed for this to work properly) but the general idea is here:

- Clone the repo, run `npm install`, start the dev server, check that `localhost:5173` is serving `index.html`.
- Create a branch for your component - all dev work goes here. If you're working on multiple, each gets its own branch.
- In `dev/`, create and build your component.  
  - SINGLE FILE components stay in `dev/`
  - MULTI FILE components get their own folder: `dev/component-name/`
- In `index.html` make sure you're importing `src/main-dev.js` and check your component using localhost
- Once your component works locally, run `npm run build:dev-bundle` to generate `dist/widgets-dev.js`.
- Get the SHA for that commit to use in the CDN link, put the `<script>` in the Shorthand settings and test in Shorthand
- Once that works, move your component from `dev` to `lib` and make your PR
- PR Reviewers: confirm things work in Shorthand, then delete `widgets-dev.js` and approve the PR
- On approval, merge the PR and create a release
  - On `main` ONLY, run `npm run build`, create a new commit for the updated file, use the new version number for the commit message, push the commit.
  - Once the commit is pushed, create and push a tag using that same version number.

## Detailed Workflow Instructions
Say we want to build `cool-component`:

### Setup
- Make sure you have Node 20+ and npm
- Clone repo down locally
- From `main`, create and checkout a branch for your component, like `feat/cool-component`.
  - A branch is for dev of a single component. If you have others, they'll need their own branches.
- Run `npm install`
- Run `npm run dev` to get the local server running. Check `localhost:5173` to make sure that what's in `index.html` is running.

### Local Dev
- In `src/dev`, create `CoolComponent.ce.svelte`
  - A **single file** component like `CoolComponent.ce.svelte` goes directly inside `dev/`
  - A **multi file** component gets its own directory inside `dev/`, e.g. `dev/complex-component`.
- In `index.html`, make sure you're using `<script type="module" src="/src/dev-main.js"></script>` so it pulls from the `dev` directory
- Work on your component, use localhost to check that it's working
- Once you're happy with your component, run `npm run build:dev-bundle`. This creates `dist/widgets-dev.js`.
  - This command should only ever be run in a dev branch, never on `main`.
- Commit and push your changes to your branch, `feat/cool-component`.

### Test in Shorthand
- Once you've pushed your component to your branch, run `git rev-parse HEAD` to get the SHA of the last commit you made (the one that pushed your changes to GitHub). It'll look like a giant string, `9c1e1a7f8f3827b11fb9eb34ab0a21afde30e19c`.
- In Shorthand, add the CDN `<script>` tag to the story's settings, down under "CUSTOM `<HEAD>`".
  - You want to put your SHA after the @ in the link.
  - The formula is: `<script src="https://cdn.jsdelivr.net/gh/CSIS-iLab/ilab-web-components@YOUR_SHA_HERE/dist/widgets-dev.js"></script>`
- From here, you can use your component in any custom HTML section by using its registered name, e.g. `<csis-cool-component>`.

#### Why the SHA?
- jsDelivr caches incredibly hard, so it won't automatically grab the newest version of your file. (We also don't want it to, to protect stories from breaking as the library develops.)
- Using the SHA forces jsDelivr to grab the file as it is in that specific commit.  
- Avoids needing to create/maintain tags; these are throwaway dev-only files.

### Prep for your Pull Request
- If you're ready for your component to move into production, move your `*.ce.svelte` file FROM `dev` TO `lib`.
- You do NOT need to run any build command. That will be done on `main`.

### Make a Pull Request
-  Once your happy with how your component is performing in Shorthand, it's time to make a PR to merge your branch to `main`.
-  Your PR should 
   -  Describe your component AND define any attributes it has for documentation. These should be written down as they'd be used by producers/users (e.g. "text-color") not as they are in the JS (e.g. "textColor").
      -  e.g. "`text-color` - The color of all text" 
   -  Include a screenshot of your component
   -  Include the SHA used to check your component in Shorthand

### Reviewing a Pull Request
- If you're reviewing someone else's PR, use the SHA they provide and double check that the component works in a Shorthand story.
- If it does, hooray! Delete `dist/widgets.js` and approve the PR.

### Merge your PR and release an update
Once your PR is approved, it's time to merge and update the library! 

- Merge your PR to `main` and delete the branch.
- In your editor, checkout the `main` branch and then `git pull` to make sure you've got the newest version that includes your changes.
- Run `npm run build` to generate the new `dist/widgets.js` file that incorporates your new component.
- Run `git describe --tags --abbrev=0` to see the most latest version tag.
- Figure out what the next version should be using SemVer: `MAJOR.MINOR.PATCH`
   - MAJOR version when there are breaking changes
     - Examples: removing a component from the library, renaming a component, renaming a component attribute, changing default behavior that affects layout, renaming or removing CSS custom properties, changing visual defaults like text color or background color
   - MINOR version when functionality is added and backward compatible
     - Examples: adding new components
   - PATCH version for bug fixes
     - Examples: bug fixes, style corrections, internal refactoring, performance improvements, fixing typos in default text
- Create a commit for the new dist file using the new version as the message, e.g.: `git commit -m "Release v1.3.0"`
- Push your commit
- Tag your commit and push your tag
  - `git tag v1.3.0`
  - `git push --tags`

And that's it! A new release has been created! Any Shorthand stories waiting on your new component should use the new version, and any documentation should be updated to reflect the new version.

And old stories or web pages that are using an old version do _not_ need to be updated. Because we're telling jsDelivr to reference specific commits by using tags, those old stories will always reference that specific working version of the `widgets.js` file. It will not be broken or updated by our future versions.

## Brief Guidelines for Components
1. Props should map cleanly to HTML attributes, using kebab case.
2. Styles should stay in Shadow DOM. Avoid `:global` if at all possible. If you need it, scope it to your component: `:global(.my-component-wrapper a){...}`. Never use unscoped `:global` selectors like `a` and `p`.
3. CSS customization should use component-specific custom properties (e.g. `--cpp-callout-bg`)
