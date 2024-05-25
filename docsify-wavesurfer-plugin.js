import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';

export function initWaveSurfer() {
    const supportedAudioExtensions = ['.m4a', '.mp3', '.wav', '.aac', '.wma', '.flac', '.opus', '.ogg'];

    handleAudioTags();
    handleAudioLinks();

    function handleAudioTags() {
        const audios = document.querySelectorAll('audio');
        audios.forEach(audio => {
            const audioSrc = audio.querySelector('source')?.src;
            if (audioSrc) {
                const container = document.createElement('div');
                audio.parentNode.replaceChild(container, audio);
                createWaveSurferPlayer(audioSrc, container);
            }
        });
    }

    function handleAudioLinks() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const url = link.href.toLowerCase();
            if (supportedAudioExtensions.some(ext => url.endsWith(ext))) {
                const audioSrc = link.href.replace(/#\//, '');
                const description = link.innerText || link.textContent;
                const container = document.createElement('div');
                link.parentNode.replaceChild(container, link);
                createWaveSurferPlayer(audioSrc, container, description);
            }
        });
    }

    function createWaveSurferPlayer(audioSrc, container, description = '') {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        container.appendChild(wrapper);

        const playPauseButton = createPlayPauseButton();

        let title;
        if (description) {
            title = document.createElement('div');
            title.innerText = description;
            title.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                font-weight: bold;
                background-color: rgba(255, 255, 255, 0.7);
                color: black;
                padding: 5px;
                cursor: pointer;
                z-index: 10;
                opacity: 0.9;
                font-size: 12px;
            `;
            title.onclick = playPauseButton.onclick;
            wrapper.appendChild(title);
        }

        const waveColor = getComputedStyle(document.documentElement).getPropertyValue('--wave-color').trim() || '#ababab';
        const progressColor = getComputedStyle(document.documentElement).getPropertyValue('--progress-color').trim() || '#dadada';

        const wavesurfer = WaveSurfer.create({
            container: wrapper,
            waveColor: waveColor,
            progressColor: progressColor,
            backend: 'MediaElement'
        });

        const currentTimeLabel = document.createElement('div');
        currentTimeLabel.style.cssText = `
            position: absolute;
            top: 40px;
            left: 10px;
            background-color: rgba(255, 255, 255, 0.7);
            color: black;
            padding: 5px;
            z-index: 5;
            opacity: 0.9;
            font-family: monospace;
            font-size: 12px;
            display: none;
        `;
        currentTimeLabel.innerHTML = formatTime(0); // Initialize at zero
        wrapper.appendChild(currentTimeLabel);

        const totalTimeLabel = document.createElement('div');
        totalTimeLabel.style.cssText = `
            position: absolute;
            top: 40px;
            right: 10px;
            background-color: rgba(255, 255, 255, 0.7);
            color: black;
            padding: 5px;
            z-index: 5;
            opacity: 0.9;
            font-family: monospace;
            font-size: 12px;
            display: none;
        `;
        wrapper.appendChild(totalTimeLabel);

        const updateCurrentTime = () => {
            const currentTime = wavesurfer.getCurrentTime();
            currentTimeLabel.innerHTML = formatTime(currentTime);
            totalTimeLabel.innerHTML = formatTime(wavesurfer.getDuration());
        };

        wavesurfer.on('audioprocess', updateCurrentTime);
        wavesurfer.on('seek', updateCurrentTime);

        wavesurfer.on('ready', () => {
            totalTimeLabel.innerHTML = formatTime(wavesurfer.getDuration());
        });

        wavesurfer.load(audioSrc);
        playPauseButton.wavesurfer = wavesurfer;
        wavesurfer.on('play', () => {
            playPauseButton.style.backgroundColor = 'darkgrey';
            playPauseButton.innerHTML = '⏸️';
            if (title) {
                title.style.boxShadow = 'inset 0px 0px 5px #000000';
            }
        });
        wavesurfer.on('pause', () => {
            playPauseButton.style.backgroundColor = 'white';
            playPauseButton.innerHTML = '▶️';
            if (title) {
                title.style.boxShadow = '';
            }
        });

        const controlsContainer = createControlsContainer(wavesurfer, playPauseButton);
        wrapper.appendChild(controlsContainer);
        container.style.margin = '10px 0';

        // Add settings button to toggle toolbar visibility
        createSettingsButton(wrapper, controlsContainer, currentTimeLabel, totalTimeLabel);

        setInterval(updateCurrentTime, 100); // Update every 100ms
    }

    function createControlsContainer(wavesurfer, playPauseButton) {
        const controlsContainer = document.createElement('div');
        controlsContainer.style.cssText = `
            display: none; /* Hide toolbar by default */
            flex-direction: column;
            align-items: center;
            margin-top: 10px;
        `;

        const transportControls = createTransportControls(wavesurfer, playPauseButton);
        controlsContainer.appendChild(transportControls);

        const speedControlContainer = createSpeedControlContainer(wavesurfer);
        controlsContainer.appendChild(speedControlContainer);

        const volumeControlContainer = createVolumeControlContainer(wavesurfer);
        controlsContainer.appendChild(volumeControlContainer);

        controlsContainer.speedControlContainer = speedControlContainer;
        controlsContainer.volumeControlContainer = volumeControlContainer;

        return controlsContainer;
    }

    function createSettingsButton(wrapper, toolbar, currentTimeLabel, totalTimeLabel) {
        const settingsButton = document.createElement('button');
        settingsButton.innerHTML = '🔧';
        settingsButton.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: white;
            border: 1px solid black;
            border-radius: 4px;
            cursor: pointer;
            padding: 5px;
            z-index: 10;
        `;
        settingsButton.onclick = () => {
            const isToolbarVisible = toolbar.style.display === 'block';
            toolbar.style.display = isToolbarVisible ? 'none' : 'block';
            currentTimeLabel.style.display = isToolbarVisible ? 'none' : 'block';
            totalTimeLabel.style.display = isToolbarVisible ? 'none' : 'block';
        };
        wrapper.appendChild(settingsButton);
    }

    function seekToTime(wavesurfer, inputValue) {
        const time = parseTimeInput(inputValue);
        if (time !== null) {
            const isPlaying = wavesurfer.isPlaying();
            if (isPlaying) wavesurfer.pause();
            wavesurfer.once('seek', () => {
                if (isPlaying) wavesurfer.play();
            });
            wavesurfer.seekTo(time / wavesurfer.getDuration());
        }
    }

    function parseTimeInput(input) {
        const parts = input.split(':');
        if (parts.length === 2) {
            const minutes = parseInt(parts[0], 10);
            const seconds = parseFloat(parts[1]);
            if (!isNaN(minutes) && !isNaN(seconds)) {
                return minutes * 60 + seconds;
            }
        }
        return null;
    }

    function createTransportControls(wavesurfer, playPauseButton) {
        const transportControls = document.createElement('div');
        transportControls.style.cssText = `
            display: flex;
            justify-content: center;
            margin-bottom: 10px;
        `;

        transportControls.appendChild(createGoToStartButton(wavesurfer));
        transportControls.appendChild(playPauseButton);
        transportControls.appendChild(createLoopButton(wavesurfer));
        transportControls.appendChild(createSpeedToggleButton());
        transportControls.appendChild(createVolumeToggleButton());

        return transportControls;
    }

    function createButton(icon) {
        const button = document.createElement('button');
        button.style.cssText = `
            margin: 0 5px;
            background: white;
            border: 1px solid black;
            border-radius: 4px;
            cursor: pointer;
            padding: 5px;
        `;
        button.innerHTML = icon;
        return button;
    }

    function createPlayPauseButton() {
        const playPauseBtn = createButton('▶️');
        playPauseBtn.onclick = () => {
            if (playPauseBtn.wavesurfer.isPlaying()) {
                playPauseBtn.wavesurfer.pause();
            } else {
                playPauseBtn.wavesurfer.play();
            }
        };
        return playPauseBtn;
    }

    function createLoopButton(wavesurfer) {
        const loopBtn = createButton('🔁');
        let isLooping = false;
        loopBtn.onclick = () => {
            isLooping = !isLooping;
            if (isLooping) {
                wavesurfer.on('finish', wavesurfer.play.bind(wavesurfer));
                loopBtn.style.backgroundColor = 'darkgrey';
            } else {
                wavesurfer.un('finish', wavesurfer.play.bind(wavesurfer));
                loopBtn.style.backgroundColor = '';
            }
        };
        return loopBtn;
    }

    function createGoToStartButton(wavesurfer) {
        const goToStartBtn = createButton('⏮️');
        goToStartBtn.onclick = () => {
            wavesurfer.seekTo(0);
        };
        return goToStartBtn;
    }

    function createSpeedToggleButton() {
        const speedToggleBtn = createButton('⏱️');
        speedToggleBtn.onclick = (event) => {
            const controlsContainer = event.currentTarget.closest('div').parentNode;
            const speedControlContainer = controlsContainer.speedControlContainer;
            const isVisible = speedControlContainer.style.display === 'flex';
            speedControlContainer.style.display = isVisible ? 'none' : 'flex';
            speedToggleBtn.style.backgroundColor = isVisible ? '' : 'darkgrey';
        };
        return speedToggleBtn;
    }

    function createVolumeToggleButton() {
        const volumeToggleBtn = createButton('🔊');
        volumeToggleBtn.onclick = (event) => {
            const controlsContainer = event.currentTarget.closest('div').parentNode;
            const volumeControlContainer = controlsContainer.volumeControlContainer;
            const isVisible = volumeControlContainer.style.display === 'flex';
            volumeControlContainer.style.display = isVisible ? 'none' : 'flex';
            volumeToggleBtn.style.backgroundColor = isVisible ? '' : 'darkgrey';
        };
        return volumeToggleBtn;
    }

    function createSpeedControlContainer(wavesurfer) {
        const speedControlContainer = document.createElement('div');
        speedControlContainer.style.cssText = `
            display: none;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
        `;

        const speedLabel = createButton('⏱️');
        speedControlContainer.appendChild(speedLabel);

        const speedControl = document.createElement('input');
        speedControl.type = 'range';
        speedControl.min = 0;
        speedControl.max = 100;
        speedControl.step = 1;
        speedControl.value = 50;
        speedControl.style.margin = '0 10px';
        speedControl.oninput = () => {
            const sliderValue = parseFloat(speedControl.value);
            const actualSpeed = mapSliderValueToSpeed(sliderValue);
            wavesurfer.setPlaybackRate(actualSpeed);
            speedReadout.innerHTML = actualSpeed.toFixed(2) + 'x';
        };
        speedControlContainer.appendChild(speedControl);

        const speedReadout = document.createElement('span');
        speedReadout.className = 'speed-readout';
        speedReadout.innerHTML = '1.00x';
        speedReadout.style.cssText = `
            margin-left: 10px;
            font-family: monospace;
            font-size: 12px;
        `;
        speedControlContainer.appendChild(speedReadout);

        speedLabel.onclick = () => {
            speedControl.value = 50;
            wavesurfer.setPlaybackRate(1);
            speedReadout.innerHTML = '1.00x';
        };

        return speedControlContainer;
    }

    function mapSliderValueToSpeed(value) {
        if (value < 50) {
            return value / 50;  // Maps 0-50 to 0-1
        } else {
            return 1 + (value - 50) * 0.14; // Maps 50-100 to 1-8
        }
    }

    function createVolumeControlContainer(wavesurfer) {
        const volumeControlContainer = document.createElement('div');
        volumeControlContainer.style.cssText = `
            display: none;
            flex-direction: row;
            justify-content: center;
            align-items: center;
        `;

        const volumeLabel = createButton('🔊');
        volumeControlContainer.appendChild(volumeLabel);

        const volumeControl = document.createElement('input');
        volumeControl.type = 'range';
        volumeControl.min = 0;
        volumeControl.max = 1;
        volumeControl.step = 0.01;
        volumeControl.value = wavesurfer.getVolume();
        volumeControl.style.margin = '0 10px';
        volumeControl.oninput = () => {
            wavesurfer.setVolume(volumeControl.value);
            volumeReadout.innerHTML = padVolume((volumeControl.value * 100).toFixed(0)) + '%';
        };
        volumeControlContainer.appendChild(volumeControl);

        const volumeReadout = document.createElement('span');
        volumeReadout.innerHTML = padVolume('100%');
        volumeReadout.style.cssText = `
            margin-left: 10px;
            width: 40px;
            display: inline-block;
            text-align: right;
            font-family: monospace;
            font-size: 12px;
        `;
        volumeControlContainer.appendChild(volumeReadout);

        volumeLabel.onclick = () => {
            volumeControl.value = 1;
            wavesurfer.setVolume(1);
            volumeReadout.innerHTML = '100%';
        };

        return volumeControlContainer;
    }

    function padVolume(volume) {
        return volume.padStart(3, '0');
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const millis = Math.floor((seconds % 1) * 1000);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}.${millis < 100 ? '0' : ''}${millis < 10 ? '0' : ''}${millis}`;
    }

    window.$docsify.plugins = [].concat(function (hook, vm) {
        hook.doneEach(() => {
            initWaveSurfer();
        });
    }, window.$docsify.plugins);
}
