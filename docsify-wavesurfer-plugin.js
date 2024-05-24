// docsify-wavesurfer-plugin.js

(function () {
  function initWaveSurfer() {
    // Supported audio extensions
    var supportedAudioExtensions = ['.m4a', '.mp3', '.wav', '.aac', '.wma', '.flac', '.opus', '.ogg'];

    // Handle audio tags
    var audios = document.querySelectorAll('audio');
    audios.forEach(function(audio) {
      var audioSrc = audio.querySelector('source').src;
      var container = document.createElement('div');
      audio.parentNode.replaceChild(container, audio);
      createWaveSurferPlayer(audioSrc, container, null);
    });

    // Handle links to supported audio files
    var links = document.querySelectorAll('a[href]');
    links.forEach(function(link) {
      var url = link.href.toLowerCase();
      if (supportedAudioExtensions.some(ext => url.endsWith(ext))) {
        var audioSrc = link.href.replace(/#\//, '');
        var description = link.innerText || link.textContent;
        var container = document.createElement('div');
        link.parentNode.replaceChild(container, link);
        createWaveSurferPlayer(audioSrc, container, description);
      }
    });
  }

  function createWaveSurferPlayer(audioSrc, container, description) {
    // Create a wrapper for the title and player
    var wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    container.appendChild(wrapper);

    // Create title element if description is provided
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
      backend: 'MediaElement'
    });

    wavesurfer.load(audioSrc);

    // Create custom controls container
    var controlsContainer = document.createElement('div');
    controlsContainer.style.display = 'flex';
    controlsContainer.style.flexDirection = 'column';
    controlsContainer.style.alignItems = 'center';
    controlsContainer.style.marginTop = '10px';
    wrapper.appendChild(controlsContainer);

    // Transport controls
    var transportControls = document.createElement('div');
    transportControls.style.display = 'flex';
    transportControls.style.justifyContent = 'center';
    transportControls.style.marginBottom = '10px';
    controlsContainer.appendChild(transportControls);

    // Play/Pause button
    var playPauseBtn = document.createElement('button');
    playPauseBtn.innerHTML = '▶️';
    playPauseBtn.style.margin = '0 5px';
    playPauseBtn.onclick = function () {
      wavesurfer.playPause();
      playPauseBtn.innerHTML = wavesurfer.isPlaying() ? '⏸️' : '▶️';
    };
    transportControls.appendChild(playPauseBtn);

    // Loop button
    var loopBtn = document.createElement('button');
    loopBtn.innerHTML = '🔁';
    loopBtn.style.margin = '0 5px';
    var isLooping = false;
    loopBtn.onclick = function () {
      isLooping = !isLooping;
      if (isLooping) {
        wavesurfer.on('finish', function () {
          wavesurfer.play();
        });
        loopBtn.style.backgroundColor = 'lightblue';
      } else {
        wavesurfer.un('finish', function () {
          wavesurfer.play();
        });
        loopBtn.style.backgroundColor = '';
      }
    };
    transportControls.appendChild(loopBtn);

    // Fast Forward button
    var fastForwardBtn = document.createElement('button');
    fastForwardBtn.innerHTML = '⏩';
    fastForwardBtn.style.margin = '0 5px';
    var isFastForwarding = false;
    fastForwardBtn.onclick = function () {
      isFastForwarding = !isFastForwarding;
      if (isFastForwarding) {
        wavesurfer.setPlaybackRate(wavesurfer.getPlaybackRate() * 10);
        fastForwardBtn.style.backgroundColor = 'lightblue';
      } else {
        wavesurfer.setPlaybackRate(wavesurfer.getPlaybackRate() / 10);
        fastForwardBtn.style.backgroundColor = '';
      }
    };
    transportControls.appendChild(fastForwardBtn);

    // Speed toggle button
    var speedToggleBtn = document.createElement('button');
    speedToggleBtn.innerHTML = '⚡';
    speedToggleBtn.style.margin = '0 5px';
    var isSpeedVisible = false;
    speedToggleBtn.onclick = function () {
      isSpeedVisible = !isSpeedVisible;
      speedControlContainer.style.display = isSpeedVisible ? 'flex' : 'none';
      speedToggleBtn.style.backgroundColor = isSpeedVisible ? 'lightblue' : '';
    };
    transportControls.appendChild(speedToggleBtn);

    // Volume toggle button
    var volumeToggleBtn = document.createElement('button');
    volumeToggleBtn.innerHTML = '🔊';
    volumeToggleBtn.style.margin = '0 5px';
    var isVolumeVisible = false;
    volumeToggleBtn.onclick = function () {
      isVolumeVisible = !isVolumeVisible;
      volumeControlContainer.style.display = isVolumeVisible ? 'flex' : 'none';
      volumeToggleBtn.style.backgroundColor = isVolumeVisible ? 'lightblue' : '';
    };
    transportControls.appendChild(volumeToggleBtn);

    // Speed control
    var speedControlContainer = document.createElement('div');
    speedControlContainer.style.display = 'none';
    speedControlContainer.style.alignItems = 'center';
    speedControlContainer.style.marginBottom = '10px';
    controlsContainer.appendChild(speedControlContainer);

    var speedLabel = document.createElement('span');
    speedLabel.innerHTML = '⚡';
    speedControlContainer.appendChild(speedLabel);

    var speedControl = document.createElement('input');
    speedControl.type = 'range';
    speedControl.min = 0.1;
    speedControl.max = 2;
    speedControl.step = 0.01;
    speedControl.value = 1;
    speedControl.style.margin = '0 10px';
    speedControl.oninput = function () {
      var speed = parseFloat(speedControl.value);
      wavesurfer.setPlaybackRate(speed);
      speedReadout.innerHTML = speed.toFixed(2) + 'x';
    };
    speedControlContainer.appendChild(speedControl);

    var speedReadout = document.createElement('span');
    speedReadout.innerHTML = '1.00x';
    speedControlContainer.appendChild(speedReadout);

    // Volume control
    var volumeControlContainer = document.createElement('div');
    volumeControlContainer.style.display = 'none';
    volumeControlContainer.style.alignItems = 'center';
    controlsContainer.appendChild(volumeControlContainer);

    var volumeLabel = document.createElement('span');
    volumeLabel.innerHTML = '🔊';
    volumeControlContainer.appendChild(volumeLabel);

    var volumeControl = document.createElement('input');
    volumeControl.type = 'range';
    volumeControl.min = 0;
    volumeControl.max = 1;
    volumeControl.step = 0.01;
    volumeControl.value = wavesurfer.getVolume();
    volumeControl.style.margin = '0 10px';
    volumeControl.oninput = function () {
      wavesurfer.setVolume(volumeControl.value);
      volumeReadout.innerHTML = padVolume((volumeControl.value * 100).toFixed(0)) + '%';
    };
    volumeControlContainer.appendChild(volumeControl);

    var volumeReadout = document.createElement('span');
    volumeReadout.style.width = '40px'; // Ensures the width is consistent
    volumeReadout.style.display = 'inline-block'; // Makes the width fixed
    volumeReadout.innerHTML = '100%';
    volumeControlContainer.appendChild(volumeReadout);

    // Helper function to pad volume percentage
    function padVolume(volume) {
      return volume.length < 2 ? '0' + volume : volume;
    }

    // Optional: Styling the container
    container.style.margin = '10px 0';
  }

  window.$docsify.plugins = [].concat(function (hook, vm) {
    hook.doneEach(function () {
      initWaveSurfer();
    });
  }, window.$docsify.plugins);
})();
