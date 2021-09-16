This whole `./app` should probably be moved into a separate library.

Theater:
-> Create a new scenario

Probably the PIXI components should be included in the dependency injection. Will make the code way cleaner:

```
@injectable()
class HUDPreparer {
  constructor(@inject() preferencesService: PreferencesService) {
  
  }
  
  prepare() {
  
  
  }

}
```

```

class SliderPreparer {
  constructor(@inject() sliderTextureManager: SliderTextureManager, 
             @inject() skinManager: SkinManager) {
  
  }
  prepareSlider(sliderContainer: SliderContainer, slider: Slider) {
     skinManager.getCurrentSkin().sliderBorderColor ... 
     ...
  }
}

```


