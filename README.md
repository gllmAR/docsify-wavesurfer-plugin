# docsify-wavesurfer-plugin

## Introduction

This Docsify plugin converts markdown links to audio files and audio tags into WaveSurfer.js players with custom control. 
Additionally, it displays the link description as the title of the audio, positioned over the waveform in the top left corner.

## Demo

### markdown link

```markdown
[demonstrative ](./media/demonstrative.mp3)
```

[demonstrative ](./media/demonstrative.mp3)


### long File

[Echoes of Thought](./media/Echoes%2520of%2520Thought.mp3)


### [in array](./table.md)

#### 2 x 2 
| 1   | 2    | 
| --- |  --- |
| [jinglebellssms ](./media/jinglebellssms.mp3) | [demonstrative](./media/demonstrative.mp3) |
| [solemn ](./media/solemn.mp3) | [isntit_a_super_long_label with space and special *char* %](./media/isntit.mp3) |

#### 1 x 2

| 1   | 
| --- | 
| [jinglebellssms ](./media/jinglebellssms.mp3) | 
| [solemn ](./media/solemn.mp3) |


## Features

* Converts markdown links to audio files and audio tags to WaveSurfer.js players.
* Supports various audio file extensions: .m4a, .mp3, .wav, .aac, .wma, .flac, .opus, .ogg.
* Displays link descriptions as titles over the waveform.
* Custom controls button for 
  * play/pause, 
  * Toggle loop
  * Playback speed 
  * Volume

## Open source

* [Source code on Github](https://github.com/gllmAR/docsify-wavesurfer-plugin)
* [Demo](https://gllmar.github.io/docsify-wavesurfer-plugin)

## Installation

### Add the plugin as module to your docsify index.html document

```html
  <script src="https://unpkg.com/docsify/lib/docsify.min.js"></script>
  <script type="module">
    import { initWaveSurfer } from 'https://gllmar.github.io/docsify-wavesurfer-plugin/docsify-wavesurfer-plugin.js';
    initWaveSurfer();
  </script>
```

### create links supported audio file in md

```markdown
[solemn ](./media/solemn.mp3)
```

[solemn ](./media/solemn.mp3)

### support also audio tag

```
<audio>
  <source src="./media/demonstrative.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>

```
<audio>
  <source src="./media/demonstrative.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>


## License

This plugin is released under the MIT License.



## Contributing


Feel free to open issues or submit pull requests to improve the plugin.