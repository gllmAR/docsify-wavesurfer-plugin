# docsify-wavesurfer-plugin

[docsify-wavesurfer-plugin](https://gllmar.github.io/docsify-wavesurfer-plugin/#/)

This Docsify plugin converts audio tags and links to audio files into WaveSurfer.js players with native controls. Additionally, it displays the link description as the title of the audio, positioned over the waveform in the top left corner.


* [demonstrative ](./media/demonstrative.mp3)

```
https://gllmar.github.io/docsify-wavesurfer-plugin/docsify-wavesurfer-plugin.js
```

## Features

* Converts audio tags and links to audio files into WaveSurfer.js players.
* Supports various audio file extensions: .m4a, .mp3, .wav, .aac, .wma, .flac, .opus, .ogg.
* Displays link descriptions as titles over the waveform.
* Native media controls for play, pause, seek, etc.



## Usage

### Audio Example with Audio Tag

<audio>
  <source src="path/to/your/audiofile.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>

Audio Links

You can also use links to audio files. The link description will be displayed as the title of the audio player.

markdown

### Audio Example with Link

[This is the description](./media/demonstrative.mp3)
[Another description](./media/isntit.mp3)

### Customization
#### Title Style

To customize the style of the title displayed over the waveform, modify the CSS styles in the plugin script. You can adjust the font, background color, padding, and other properties as needed.

##### Example:

```javascript

function createWaveSurferPlayer(audioSrc, container, description) {
  var wrapper = document.createElement('div');
  wrapper.style.position = 'relative';
  container.appendChild(wrapper);

  if (description) {
    var title = document.createElement('div');
    title.innerText = description;
    title.style.position = 'absolute';
    title.style.top = '0';
    title.style.left = '0';
    title.style.fontWeight = 'bold';
    title.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    title.style.padding = '5px';
    title.style.zIndex = '10';
    wrapper.appendChild(title);
  }

  var wavesurfer = WaveSurfer.create({
    container: wrapper,
    waveColor: 'violet',
    progressColor: 'purple',
    backend: 'MediaElement',
    mediaControls: true
  });

  wavesurfer.load(audioSrc);
  container.style.margin = '10px 0';
}
```

#### WaveSurfer Options

You can customize the WaveSurfer player options by modifying the WaveSurfer.create call in the plugin script.

Example:

```javascript

var wavesurfer = WaveSurfer.create({
  container: wrapper,
  waveColor: 'violet',
  progressColor: 'purple',
  backend: 'MediaElement',
  mediaControls: true,
  height: 128, // Set the height of the waveform
  barWidth: 2, // Set the width of the waveform bars
  barGap: 3 // Set the gap between waveform bars
});

```



## Examples

### Markdown link

This markdown 

```
* [demonstrative ](./media/demonstrative.mp3)
* [isntit](./media/isntit.mp3)
* [jinglebellssms](./media/jinglebellssms.mp3)
* [served](./media/served.mp3)
* [solemn](./media/solemn.mp3)
```
result in 

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


### License

This plugin is released under the MIT License.



### Contributing


Feel free to open issues or submit pull requests to improve the plugin.