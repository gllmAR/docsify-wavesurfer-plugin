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
      backend: 'MediaElement', // Use the MediaElement backend to get native controls
      mediaControls: true // Show native controls
    });

    wavesurfer.load(audioSrc);

    // Optional: Styling the container
    container.style.margin = '10px 0';
  }

  window.$docsify.plugins = [].concat(function (hook, vm) {
    hook.doneEach(function () {
      initWaveSurfer();
    });
  }, window.$docsify.plugins);
})();
