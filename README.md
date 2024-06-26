# [docsify-wavesurfer-plugin](https://gllmar.github.io/docsify-wavesurfer-plugin)

## Introduction

This Docsify plugin converts markdown links to audio files and audio tags into WaveSurfer.js players with custom control. 
Additionally, it displays the link description as the title of the audio and as a play/pause button as well as providing additionnal control via a gear menu.

### turn markdown link

```markdown
[demonstrative](./media/demonstrative.mp3)
```
### into wavesurfer player

[demonstrative](media/demonstrative.mp3)

### [examples](./examples.md)


## Features

* Converts markdown links to audio files and audio tags to WaveSurfer.js players.
* Supports various audio file extensions: .m4a, .mp3, .wav, .aac, .wma, .flac, .opus, .ogg.
* Displays link descriptions as titles over the waveform.
* Custom controls button for 
  * play/pause, 
  * Toggle loop
  * Playback speed 
  * Volume

## Installation

### import module

```html
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: '',
      repo: '',
      plugins: [
        function(hook, vm) {
          hook.doneEach(() => {
            import('./docsify-wavesurfer-plugin.js').then(module => {
              module.initWaveSurfer();
            }).catch(err => console.error('Failed to load WaveSurfer plugin', err));
          });
        }
      ]
    };
  </script>
  <script src="https://unpkg.com/docsify/lib/docsify.min.js"></script>
</body>
```

### create links to audio in md

```markdown
[solemn ](./media/solemn.mp3)
```

[solemn ](./media/solemn.mp3)

### support also audio tag

```
<audio>
  <source src="./media/demonstrative.mp3" type="audio/mpeg">
  this is the description label
</audio>

```
<audio>
  <source src="./media/demonstrative.mp3" type="audio/mpeg">
  this is the description label
</audio>


## License

This plugin is released under the MIT License.


## Contributing

Feel free to open issues or submit pull requests to improve the plugin.

### [Github Repositorie](https://github.com/gllmAR/docsify-wavesurfer-plugin)

