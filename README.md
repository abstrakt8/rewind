<h1 align="center">Rewind</h1>

<p align="center">osu! replay viewer that enables you see to it.</p>

## Library structure

`osu` contains general game logic that can be used in browser and on node.js

`osu-local` on the other hand contains node.js libraries that focus on retrieving the osu! data.

`osu-pixi` contains libraries that deal with the rendering of the game with PixiJS.

## Generating a new library

* `osu`: `@nrwl/workspace:library`
* `osu-local`: `nrwl/nodejs:library`
* `osu-pixi`: `@nrwl/workspace:library`


# Running the desktop app


```shell
yarn run desktop:serve
```

# Testing

Set environment variable appropriately, e.g.:

```
REWIND_TEST_DIR=E:\RewindTests\osu!
```

# Building

The default skin (currently "- YUGEN - ") should be put into `resources/`


```
```

