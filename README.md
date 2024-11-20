<!-- markdownlint-configure-file {
  "MD013": {
    "code_blocks": false,
    "tables": false
  },
  "MD033": false,
  "MD041": false
} -->

<div align="center">

# UPSTREET.AI

<!-- [![](https://dcbadge.limes.pink/api/server/TfKW36rMj7)](https://discord.gg/TfKW36rMj7) -->
[![Discord](https://img.shields.io/badge/Discord-%235865F2.svg?style=for-the-badge&logo=discord&logoColor=white)](https://upstreet.ai/usdk-discord)
[![NPM](https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white)](https://npmjs.org/package/usdk)
[![X](https://img.shields.io/badge/X-%23000000.svg?style=for-the-badge&logo=X&logoColor=white)](https://x.com/upstreetai)

Welcome to the main monorepo of [Upstreet.ai](https://upstreet.ai), which contains all our open-source subprojects.

> We ❤️ Open Source! Star (⭐️) this repo to support our development.

[Table of Contents](#in-this-repo) •
[Getting started with USDK](#getting-started-with-usdk) •
[Integrations](#integrations) •
[Contributing](#contributing)

</div>

## In this repo...
### Chat App:
- 🌐 Link: https://upstreet.ai
- 📁 Directory: [/apps/chat](https://github.com/UpstreetAI/monorepo/tree/main/apps/chat)
- 📖 Documentation: [/apps/chat/README.md](https://github.com/UpstreetAI/monorepo/blob/main/apps/chat/README.md)

### Docs:
- 🌐 Link: https://docs.upstreet.ai
- 📁 Directory: [/apps/docs](https://github.com/UpstreetAI/monorepo/tree/main/apps/docs)
- 📖 Documentation: [/apps/docs/README.md](https://github.com/UpstreetAI/monorepo/blob/main/apps/chat/README.md)

### USDK:
- 📁 Directory: [/packages/usdk](https://github.com/UpstreetAI/monorepo/tree/main/packages/usdk)
- 📖 Documentation: [/apps/docs/README.md](https://github.com/UpstreetAI/monorepo/blob/main/packages/usdk/README.md)

## Getting started with USDK

If you want to get started with Upstreet Agents in general, you can simply install `usdk` from NPM:

```bash
npm i -g usdk
```

Read more about how to use `usdk` in the [docs](https://docs.upstreet.ai/install).

If you want to dive deeper into `usdk` and Upstreet, you can [set up this repository locally.](#Setting-up-your-development-environment)

## Contributing

Found a bug? Want a new feature? [Open an issue](https://github.com/upstreetAI/monorepo/issues/new) on GitHub, or talk to the community to get help.

### Setting up your development environment

#### Install dependencies
Run install from the root directory:
```bash
npm install
```

#### Run Apps

<details>
   <summary>Run Chat App</summary>
   <br />

   > From the root directory run:
   >  ```bash
   >  npm run chat dev
   >  ```

</details>

<details>
   <summary>Run Docs App</summary>
   <br />

   > From the root directory run:
   >  ```bash
   >  npm run docs dev
   >  ```

</details>

#### Install `usdk` locally
From the root directory run:
```bash
cd packages/usdk
npm i
npm i -g .
usdk --version
```

Editing the `usdk` package will now automatically update your locally-installed version.

---

<div align="center">

<<<<<<< Updated upstream
#### Docs
```bash
npm i PACKAGE_NAME --workspace=@upstreet/docs
```

=======
### USDK is built with

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Cloudflare](https://img.shields.io/badge/Cloudflare-F38020?style=for-the-badge&logo=Cloudflare&logoColor=white)
![ChatGPT](https://img.shields.io/badge/chatGPT-74aa9c?style=for-the-badge&logo=openai&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-%230F0813.svg?style=for-the-badge&logo=Turborepo&logoColor=white)

... And many more closed source and open-source projects.
</div>
>>>>>>> Stashed changes
