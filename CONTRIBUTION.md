Project Structure
===

General
---

This repository is a mono-repo that is currently focused on the development of the Rewind desktop application. However,
as we are working with web technologies (WebGL, JS), there are also plans to implement a Rewind web version.

This mono-repo is powered by the [nx](https://nx.dev/) build system.

In `apps` you will find the applications - every folder corresponds to one "product".

In `libs` you will find the common code that is shared across all the applications.

In `tests` you will find the integration tests that will test the correctness of the libraries. Generally speaking,
tests that have some external dependencies (such as a beatmap or replay file) will belong here. Unit tests should be
written in the corresponding library `src` folder with `*.spec.ts` filename extension.

> Familiarity with [Electron's process model](https://www.electronjs.org/docs/latest/tutorial/process-model) required.
 
Setup
===
Basics
---

Install the following:

* Node.js v16.4.2 (e.g. with `nvm`)
* [`git-lfs`](https://git-lfs.github.com/) for the test data in `testdata/`


When changes have been done to some submodules, you need to merge them as follows:
```
git submodule update --remote --merge
```

Building
---

```bash
yarn install
yarn desktop:build
```

Developing
---

First start the `desktop-frontend` to expose the frontend on port 4200 with "Hot Reloading" enabled.

```bash
yarn desktop-frontend:dev
```

Then start the Electron application:

```bash
yarn desktop-main:dev
```

If you make a change in the `desktop-main` package, you will need to rerun the command above again.
