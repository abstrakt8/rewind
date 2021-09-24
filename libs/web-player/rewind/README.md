General overview of the Rewind apps: Each app can be used independently, but in the `rewind` package they are configured
and work together and share many common services such as `AudioSettingsService`.

This means that each app that is spawned through "Rewind" shares the same audio setting at any given time (or preferred skin).

The apps use dependency injection (`inversify.js`).

TODO: Provide a default `createAnalysisApp()` as a standalone.

Use the `createRewindTheater` to initialize a theater containing services that can be used to load from the API.

Analysis
---

Using this theater you can create `AnalysisStage` that can be used to:

* Normal osu! beatmap viewer / replay viewer
* View settings that can be tweaked to enable some features:
  * Hidden on/off
  * AnalyzerCursor
  * AnalysisHitErrorBar
* Additional replays added

By default, the settings are saved into the local storage.

Editor
---

* Labeling the beatmap into sections with "YouTube chapter style" (requires an internet connection to a database)
* Cut the beatmaps into multiple practice maps by selecting the "sections"
* Slow down / Increase the speed of beatmaps
* Change AR,OD,CS,HP

Recorder
---

* Simply record your replays into any format you like.

Skin Editor
---

* Instantly hot reload your changes in the skin folder and see the results in a replay!
* Compare different `hitcircle` / `hitcircleoverlay` combinations in a matrix.


