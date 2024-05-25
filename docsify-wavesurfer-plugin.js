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
        wrapper.style.minWidth = '264px';  // Adjusted by 2%
        wrapper.style.minHeight = '60px';
        container.appendChild(wrapper);

        const toolbarContainer = document.createElement('div');
        toolbarContainer.style.cssText = `
            position: absolute;
            top: 5px;
            left: 5px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: calc(100% - 10px);
            z-index: 10;
        `;
        wrapper.appendChild(toolbarContainer);

        let descriptionLabel;
        if (description) {
            descriptionLabel = document.createElement('div');
            descriptionLabel.innerText = description;
            descriptionLabel.style.cssText = `
                font-weight: bold;
                background-color: rgba(255, 255, 255, 0.7);
                color: black;
                padding: 5px;
                cursor: pointer;
                opacity: 0.9;
                font-size: 12px;
                margin-right: auto;
            `;
            toolbarContainer.appendChild(descriptionLabel);
        }

        const showHideToolbarButton = createShowHideToolbarButton();
        toolbarContainer.appendChild(showHideToolbarButton);

        const playPauseButton = createPlayPauseButton();

        const waveColor = getComputedStyle(document.documentElement).getPropertyValue('--wave-color').trim() || '#ababab';
        const progressColor = getComputedStyle(document.documentElement).getPropertyValue('--progress-color').trim() || '#dadada';

        const wavesurfer = WaveSurfer.create({
            container: wrapper,
            waveColor: waveColor,
            progressColor: progressColor,
            backend: 'MediaElement'
        });

        const timeRatioContainer = createTimeRatioContainer(wavesurfer);
        wrapper.appendChild(timeRatioContainer);

        const updateCurrentTime = () => {
            const currentTime = wavesurfer.getCurrentTime();
            timeRatioContainer.ratioLabel.innerHTML = formatTime(currentTime) + ' / ' + formatTime(wavesurfer.getDuration());
        };

        wavesurfer.on('audioprocess', updateCurrentTime);
        wavesurfer.on('seek', updateCurrentTime);

        wavesurfer.on('ready', () => {
            timeRatioContainer.ratioLabel.innerHTML = formatTime(0) + ' / ' + formatTime(wavesurfer.getDuration());
        });

        wavesurfer.load(audioSrc);
        playPauseButton.wavesurfer = wavesurfer;

        // Shared click handler for play/pause
        const togglePlayPause = () => {
            if (wavesurfer.isPlaying()) {
                wavesurfer.pause();
            } else {
                wavesurfer.play();
            }
        };

        playPauseButton.onclick = togglePlayPause;
        if (descriptionLabel) {
            descriptionLabel.onclick = togglePlayPause;
        }

        wavesurfer.on('play', () => {
            playPauseButton.style.backgroundColor = 'darkgrey';
            playPauseButton.innerHTML = '⏸️';
            if (descriptionLabel) {
                descriptionLabel.style.boxShadow = 'inset 0px 0px 5px #000000';
            }
        });
        wavesurfer.on('pause', () => {
            playPauseButton.style.backgroundColor = 'white';
            playPauseButton.innerHTML = '▶️';
            if (descriptionLabel) {
                descriptionLabel.style.boxShadow = '';
            }
        });

        const controlsContainer = createControlsContainer(wavesurfer, playPauseButton, timeRatioContainer);
        wrapper.appendChild(controlsContainer);
        container.style.margin = '10px 0';

        setInterval(updateCurrentTime, 100); // Update every 100ms
    }

    function createShowHideToolbarButton() {
        const settingsButton = document.createElement('button');
        settingsButton.innerHTML = '⚙️';
        settingsButton.style.cssText = `
            background: white;
            border: 1px solid black;
            border-radius: 4px;
            cursor: pointer;
            padding: 5px;
        `;
        settingsButton.onclick = (event) => {
            const wrapper = event.currentTarget.closest('div').parentNode;
            const toolbar = wrapper.querySelector('.controls-container');
            const timeRatioContainer = wrapper.querySelector('.time-ratio-container');
            const isToolbarVisible = toolbar.style.display === 'block';
            toolbar.style.display = isToolbarVisible ? 'none' : 'block';
        };
        return settingsButton;
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

    function createControlsContainer(wavesurfer, playPauseButton, timeRatioContainer) {
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'controls-container';
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
        controlsContainer.timeRatioContainer = timeRatioContainer;

        return controlsContainer;
    }

    function createTransportControls(wavesurfer, playPauseButton) {
        const transportControls = document.createElement('div');
        transportControls.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 10px;
        `;

        const goToStartButton = createGoToStartButton(wavesurfer);
        transportControls.appendChild(goToStartButton);

        transportControls.appendChild(playPauseButton);

        const loopButton = createLoopButton(wavesurfer);
        transportControls.appendChild(loopButton);

        const timeRatioToggleButton = createTimeRatioToggleButton();
        transportControls.appendChild(timeRatioToggleButton);

        const speedToggleButton = createSpeedToggleButton();
        transportControls.appendChild(speedToggleButton);

        const volumeToggleButton = createVolumeToggleButton();
        transportControls.appendChild(volumeToggleButton);

        return transportControls;
    }

    function createButton(icon) {
        const button = document.createElement('button');
        button.style.cssText = `
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
        playPauseBtn.onclick = (event) => {
            const wavesurfer = event.currentTarget.wavesurfer;
            if (wavesurfer) {
                wavesurfer.isPlaying() ? wavesurfer.pause() : wavesurfer.play();
            }
        };
        return playPauseBtn;
    }

    function createLoopButton(wavesurfer) {
        const loopBtn = createButton('🔁');
        let loop = false;
        loopBtn.onclick = () => {
            loop = !loop;
            if (loop) {
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

    function createTimeRatioToggleButton() {
        const timeRatioToggleBtn = createButton('🖇️');
        timeRatioToggleBtn.onclick = (event) => {
            const controlsContainer = event.currentTarget.closest('div').parentNode;
            const timeRatioContainer = controlsContainer.timeRatioContainer;
            const isVisible = timeRatioContainer.style.display === 'flex';
            timeRatioContainer.style.display = isVisible ? 'none' : 'flex';
            timeRatioToggleBtn.style.backgroundColor = isVisible ? '' : 'darkgrey';
        };
        return timeRatioToggleBtn;
    }

    function createSpeedControlContainer(wavesurfer) {
        const speedControlContainer = document.createElement('div');
        speedControlContainer.style.cssText = `
            display: none;
            flex-direction: row;
            align-items: center;
            margin-bottom: 10px;
            width: 100%;
        `;

        const speedLabel = createButton('⏱️');
        speedLabel.style.marginRight = '10px';
        speedControlContainer.appendChild(speedLabel);

        const speedControlWrapper = document.createElement('div');
        speedControlWrapper.style.cssText = `
            flex: 1;
            display: flex;
            align-items: center;
        `;
        speedControlContainer.appendChild(speedControlWrapper);

        const speedControl = document.createElement('input');
        speedControl.type = 'range';
        speedControl.min = 0;
        speedControl.max = 100;
        speedControl.step = 1;
        speedControl.value = 50;
        speedControl.style.flex = '1';
        speedControl.style.margin = '0 10px';
        speedControl.oninput = () => {
            const sliderValue = parseFloat(speedControl.value);
            const actualSpeed = mapSliderValueToSpeed(sliderValue);
            wavesurfer.setPlaybackRate(actualSpeed);
            speedReadout.innerHTML = actualSpeed.toFixed(2) + 'x';
        };
        speedControlWrapper.appendChild(speedControl);

        const speedReadout = document.createElement('span');
        speedReadout.className = 'speed-readout';
        speedReadout.innerHTML = '1.00x';
        speedReadout.style.cssText = `
            font-family: monospace;
            font-size: 12px;
            margin-left: 10px;
        `;
        speedControlWrapper.appendChild(speedReadout);

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
            align-items: center;
            width: 100%;
        `;

        const volumeLabel = createButton('🔊');
        volumeLabel.style.marginRight = '10px';
        volumeControlContainer.appendChild(volumeLabel);

        const volumeControlWrapper = document.createElement('div');
        volumeControlWrapper.style.cssText = `
            flex: 1;
            display: flex;
            align-items: center;
        `;
        volumeControlContainer.appendChild(volumeControlWrapper);

        const volumeControl = document.createElement('input');
        volumeControl.type = 'range';
        volumeControl.min = 0;
        volumeControl.max = 1;
        volumeControl.step = 0.01;
        volumeControl.value = wavesurfer.getVolume();
        volumeControl.style.flex = '1';
        volumeControl.style.margin = '0 10px';
        volumeControl.oninput = () => {
            wavesurfer.setVolume(volumeControl.value);
            volumeReadout.innerHTML = padVolume((volumeControl.value * 100).toFixed(0)) + '%';
        };
        volumeControlWrapper.appendChild(volumeControl);

        const volumeReadout = document.createElement('span');
        volumeReadout.innerHTML = padVolume('100%');
        volumeReadout.style.cssText = `
            font-family: monospace;
            font-size: 12px;
            margin-left: 10px;
        `;
        volumeControlWrapper.appendChild(volumeReadout);

        volumeLabel.onclick = () => {
            volumeControl.value = 1;
            wavesurfer.setVolume(1);
            volumeReadout.innerHTML = '100%';
        };

        return volumeControlContainer;
    }

    function createTimeRatioContainer(wavesurfer) {
        const timeRatioContainer = document.createElement('div');
        timeRatioContainer.className = 'time-ratio-container';
        timeRatioContainer.style.cssText = `
            display: none; /* Hidden by default */
            position: absolute;
            top: 90px; /* Offset to avoid overlap */
            left: 50%;
            transform: translateX(-50%);
            background-color: rgba(255, 255, 255, 0.8); /* 80% transparent */
            padding: 5px;
            border-radius: 5px;
            text-align: center;
            font-size: 10px; /* Smaller font size */
            width: auto; /* Only as wide as needed */
            white-space: nowrap; /* Ensure single line */
        `;

        const ratioLabel = document.createElement('span');
        ratioLabel.className = 'ratio-label';
        ratioLabel.style.cssText = `
            font-family: monospace;
            font-size: 10px;
            color: black; /* Ensure text is visible */
        `;
        timeRatioContainer.appendChild(ratioLabel);

        timeRatioContainer.ratioLabel = ratioLabel;

        return timeRatioContainer;
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
