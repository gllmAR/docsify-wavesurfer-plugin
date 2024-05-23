# docsify-wavesurfer-plugin

This Docsify plugin converts audio tags and links to audio files into WaveSurfer.js players with native controls. Additionally, it displays the link description as the title of the audio, positioned over the waveform in the top left corner.



## Features

* Converts audio tags and links to audio files into WaveSurfer.js players.
* Supports various audio file extensions: .m4a, .mp3, .wav, .aac, .wma, .flac, .opus, .ogg.
* Displays link descriptions as titles over the waveform.
* Native media controls for play, pause, seek, etc.

### Using markdown link (recommended)

This markdown result in 
```
* [demonstrative ](./media/demonstrative.mp3)
* [isntit](./media/isntit.mp3)
* [jinglebellssms](./media/jinglebellssms.mp3)
* [served](./media/served.mp3)
* [solemn](./media/solemn.mp3)
```

* [demonstrative ](./media/demonstrative.mp3)
* [isntit](./media/isntit.mp3)
* [jinglebellssms](./media/jinglebellssms.mp3)
* [served](./media/served.mp3)
* [solemn](./media/solemn.mp3)



### Using the audio tag (alternative)

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