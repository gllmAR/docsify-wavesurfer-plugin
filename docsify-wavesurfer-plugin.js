// docsify-wavesurfer-plugin.js

(function () {
    function initWaveSurfer() {
      var audios = document.querySelectorAll('audio');
      audios.forEach(function(audio, index) {
        var container = document.createElement('div');
        audio.parentNode.replaceChild(container, audio);
  
        var wavesurfer = WaveSurfer.create({
          container: container,
          waveColor: 'violet',
          progressColor: 'purple'
        });
  
        wavesurfer.load(audio.querySelector('source').src);
  
        // Optional: Add play/pause button
        var button = document.createElement('button');
        button.innerHTML = 'Play/Pause';
        container.appendChild(button);
        button.addEventListener('click', function() {
          wavesurfer.playPause();
        });
      });
    }
  
    window.$docsify.plugins = [].concat(function (hook, vm) {
      hook.doneEach(function () {
        initWaveSurfer();
      });
    }, window.$docsify.plugins);
  })();
  