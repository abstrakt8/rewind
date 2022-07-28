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


Rewind Desktop App
---

> Familiarity with [Electron's process model](https://www.electronjs.org/docs/latest/tutorial/process-model) required.
 
Setup
===
Basics
---

Install the following:

* Node.js v16.4.2 (e.g. with `nvm`)
* [`git-lfs`](https://git-lfs.github.com/) for the test data in `testdata/`

Building
---

```
yarn install
yarn desktop:build-package:prod
```

Developing
---

Start the `frontend` first with Hot Reloading enabled:

```
nx run desktop-frontend:serve
```

Then start the Electron application (start a build, if you have changed something in the `desktop-main`):

```
nx run desktop-main:build 
yarn run desktop:serve
```
