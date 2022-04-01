Structure
===

This repository is a mono-repo that is currently focused on the development of the Rewind desktop application. However,
as we are working with web technologies (WebGL, JS), there are also plans to implement a Rewind web version.

This mono-repo is powered by the [nx](https://nx.dev/) build system.

In `apps` you will find the applications, every folder corresponds to one "product".

In `libs` you will find the common code that is shared across all the applications.

In `tests` you will find the integration tests that will test the correctness of the libraries. Generally speaking,
tests that have some external dependencies (such as a beatmap or replay file) will belong here. Unit tests should be
written in the corresponding library `src` folder with `*.spec.ts` filename extension.


Setup
===
Basics
---

You will need the following:

* Node.js v16.4.2 (e.g. with `nvm`)

Test data
---

Download the test data and set the `REWIND_TEST_DIR` environment variable. (TODO: Link)

TODO
---

* Upload the WebStorm Jest config templates


