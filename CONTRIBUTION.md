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
 
The Rewind desktop application consists of two main renderers: `frontend` and `backend`. 
The reason that we need to expose a `backend` as a renderer is that we do not want to block the [main process](https://medium.com/actualbudget/the-horror-of-blocking-electrons-main-process-351bf11a763c), which would cause a lot of stuttering in the GUI.

The `backend` exposes its API on the port `7271`. 
This means that instead of communicating with the backend using the [Electron IPC](https://www.electronjs.org/docs/latest/tutorial/ipc), we are using very normal HTTP requests to communicate with the backend.
It might be slower, but initially it was designed to be a web application, that's why I kept it like this for now.


Setup
===
Basics
---

Install the following:

* Node.js v16.4.2 (e.g. with `nvm`)
* [`git-lfs`](https://git-lfs.github.com/) for the test data in `testdata/`

TODO
---

* Upload the WebStorm Jest config templates


