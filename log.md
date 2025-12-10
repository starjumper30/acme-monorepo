# Project Log

## Evaluate requirements and choose a tech stack

### Tools I'm most familiar with for building this type of app

- Angular for frontend.
- Nx for monorepo management.

### MVP needs

- Doesn't require any persistence layer because data is being pulled from a third party API.
- Doesn't require user authentication because it is stateless and calling an API with a server API token that can be retrieved without any credentials.
- No security + no persistence **means no need for a backend**
- **Could deploy the MVP as a single Angular app to any static hosting provider.**

### What I might need for future features

- User authentication and a persistence layer to store list of favorite movies.
- Improved handling of auth tokens if we switch to a more secure movie API.
- Server-side rendering for SEO and performance optimizations.
- load-balancing
- secret management
- artifact management for rollback and repeatable deployments

### How do I satisfy the MVP requirements quickly and simply while also positioning the project for future requirements?

- Use Nx to create a monorepo structure for our organization (acme).
  This sets us up for future growth, code reuse across projects, and good organization as this project grows.
  A nx workspace also supports a wide range of tools and frameworks that we might need to add in the future.
- Use Nx to generate a new angular app with ssr enabled, even if we don't plan to fully take advantage of it yet. The tradeoff in complexity is small.
- Deploy the angular app to Firebase hosting.
  - Pros
    - Easy and inexpensive way to get a working MVP up and running quickly.
    - Will be easy to integrate with other Firebase features later if we need to add user authentication or persistence.
    - Provides other enterprise grade features like load-balancing, secret management, artifact storage, automated builds, SSL, etc.
    - Tailored for mobile and web apps, but can easily integrate with other Google cloud products if this app becomes part of a large ecosystem of enterprise services.
  - Cons
    - None for hosting the MVP, but once we start adding features that use Firebase services like Firestore or authentication, we will be tied to a specific cloud provider.
  - **Tradeoff summary: Cheap, easy, low maintenance way to add features using cloud-native services at the expense of vendor lock-in.**

## Get a workspace going

### Create an nx workspace with an angular app. See shell output below for choices made.

Create the frontend-web app in a "movies" domain folder.
This sets us up for a mono-repo structure that can hold future projects for ACME corp as well as additional apps within the "movies" domain.

```shell
chris.hardin@VAL-US-100 starjumper30 % nvm use 24 # use latest LTS version of node
Now using node v24.11.0 (npm v11.6.1)
chris.hardin@VAL-US-100 starjumper30 % npx create-nx-workspace@latest

 NX   Let's create a new workspace [https://nx.dev/getting-started/intro]

✔ Where would you like to create your workspace? · acme
✔ Which starter do you want to use? · custom
✔ Which stack do you want to use? · angular
✔ Integrated monorepo, or standalone project? · integrated
✔ Application name · movies/frontend-web
✔ Which bundler would you like to use? · esbuild
✔ Default stylesheet format · scss
✔ Do you want to enable Server-Side Rendering (SSR) and Static Site Generation (SSG/Prerendering)? · Yes
✔ Which unit test runner would you like to use? · jest
✔ Test runner to use for end to end (E2E) tests · cypress
✔ Which CI provider would you like to use? · skip
✔ Would you like remote caching to make your build faster? · skip

 NX   Creating your v22.2.0 workspace.
```

### Verify project settings in Webstorm IDE

- verified IDE code quality settings
  - SonarCube
  - Prettier on save
  - eslint fix on save
- verified AI assistance settings
  - Jetbrains AI Assistant
  - Nx AI agents and MCP
- updated schematics in nx.json to use acme prefix and scss.
- switched to zoneless angular bootstrap
- tested serve on frontend-web app

```shell
npx nx serve movies-frontend-web
```

- commit apps as a starting point

### Set up CI/CD with Firebase hosting

- Create Firebase project in Firebase console (acme-movies-fb)
- Upgrade project to Blaze plan
- Set up App Hosting for the project
  - link to the Github repo
  - set app root to /apps/movies/frontend-web
  - have it deploy automatically from main branch
- Verify initial deployment at https://movies-web--acme-movies-fb.us-central1.hosted.app/

### Setup Local Development

- install and configure firebase cli (https://firebase.google.com/docs/app-hosting/emulate)
- run `firebase emulators:start` to serve the app locally
- The emulator errors out but the app is still being served properly. Have to run `npx kill-port 4200` to shutdown the angular dev server when you are done.

## Implement MVP

MVP requirements:

```
As a user,
● I can search for movies and see a paginated list of results
● I can filter search results by genre
● I can navigate through the next and previous pages of the paginated results
● I see the total count of search results
● I see notable information for each search result, such as the summary, poster,
duration, rating, etc.
```

### High-level tasks in order

1. Implement and test angular service for movie search
   - get auth token
   - make a graphql call using apollo-angular client
     https://the-guild.dev/graphql/apollo-angular/docs/performance/server-side-rendering#server-side-rendering
     https://github.com/kamilkisiela/apollo-angular-ssr/tree/master
   - flesh out the api service with all the calls needed to implement the MVP
2. Create a component to display movie search results by genre
3. Add pagination to the movie search results component

## Brainstorm Additional Features

- Switch between tile view and grid view
- AI integration for movie recommendations
- User profile features
  - Favorites list
  - List to track movies they've seen
  - store movie preferences (feeds into AI recommendations)
- View movie trailers in an embedded player (youtube?)
- Additional filters
- kid profile
- Have users rate movies, provide reviews
- List new releases
- Show ads for popular movies to generate revenue
- Use firebase analytics to track usage

## MISC TODO

- make sure we are deploying a production build of the app
- tests
- lint and test in ci/cd pipeline

## AI Prompts

- Generate a jest unit test for the Angular 21 component that is open in the editor, using Angular TestBed.
- Generate a jest unit test for the Angular 21 service that is open in the editor, using Angular TestBed.
- generate jest unit test for current open file
