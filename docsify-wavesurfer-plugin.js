import WaveSurfer from 'https://unpkg.com/wavesurfer.js@7/dist/wavesurfer.esm.js';

// Constants
const SUPPORTED_AUDIO_EXTENSIONS = ['.m4a', '.mp3', '.wav', '.aac', '.wma', '.flac', '.opus', '.ogg'];
const DEFAULT_WAVE_COLOR = '#cacaca';
const DEFAULT_PROGRESS_COLOR = '#aaaaaa';
const UPDATE_INTERVAL = 100; // 100ms for updating the current time

export function initWaveSurfer() {
    console.log('Initializing WaveSurfer');
    handleAudioTags();
    handleAudioLinks();
}

function handleAudioTags() {
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
        const audioSrc = audio.querySelector('source')?.src;
        if (audioSrc) {
            const description = audio.innerText.trim(); // Extract the description from the text node
            const container = document.createElement('div');
            audio.parentNode.replaceChild(container, audio);
            createWaveSurferPlayer(audioSrc, container, description);
        }
    });
}

function handleAudioLinks() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
        const url = link.href.toLowerCase();
        if (SUPPORTED_AUDIO_EXTENSIONS.some(ext => url.endsWith(ext))) {
            const audioSrc = resolveUrl(link.getAttribute('href'));
            const description = link.innerText || link.textContent;
            const container = document.createElement('div');
            link.parentNode.replaceChild(container, link);
            createWaveSurferPlayer(audioSrc, container, description);
        }
    });
}

function resolveUrl(href) {
    const base = window.location.href.split('#')[0]; // Get the base URL without the hash
    const resolvedUrl = new URL(href, base).href.replace('/#/', '/'); // Replace the hash part correctly
    console.log('Base URL:', base); // Debug output
    console.log('Resolved URL:', resolvedUrl); // Debug output
    return resolvedUrl;
}

function createWaveSurferPlayer(audioSrc, container, description = '') {
    const wrapper = createWrapper(container);
    const toolbarContainer = createToolbar(wrapper);
    const playPauseButton = createPlayPauseButton();
    const wavesurfer = initializeWaveSurfer(wrapper, audioSrc, playPauseButton);
    const timeRatioContainer = createTimeRatioContainer(wrapper);

    if (description) {
        const descriptionLabel = createDescriptionLabel(description, wavesurfer);
        toolbarContainer.appendChild(descriptionLabel);
    }

    toolbarContainer.appendChild(createShowHideToolbarButton());
    toolbarContainer.appendChild(playPauseButton);

    const controlsContainer = createControlsContainer(wavesurfer, playPauseButton, timeRatioContainer);
    wrapper.appendChild(controlsContainer);

    setInterval(() => updateCurrentTime(wavesurfer, timeRatioContainer), UPDATE_INTERVAL);
}

function initializeWaveSurfer(wrapper, audioSrc, playPauseButton) {
    const waveColor = getComputedStyle(document.documentElement).getPropertyValue('--wave-color').trim() || DEFAULT_WAVE_COLOR;
    const progressColor = getComputedStyle(document.documentElement).getPropertyValue('--progress-color').trim() || DEFAULT_PROGRESS_COLOR;

    const wavesurfer = WaveSurfer.create({
        container: wrapper,
        waveColor: waveColor,
        progressColor: progressColor,
        backend: 'MediaElementWebAudio'
    });

    wavesurfer.load(audioSrc);
    wavesurfer.on('play', () => togglePlayPauseButton(playPauseButton, wavesurfer, true));
    wavesurfer.on('pause', () => togglePlayPauseButton(playPauseButton, wavesurfer, false));

    playPauseButton.onclick = () => togglePlayPause(wavesurfer);

    return wavesurfer;
}

function togglePlayPause(wavesurfer) {
    if (wavesurfer.isPlaying()) {
        wavesurfer.pause();
    } else {
        wavesurfer.play();
    }
}

function togglePlayPauseButton(button, wavesurfer, isPlaying) {
    button.style.backgroundColor = isPlaying ? 'darkgrey' : 'white';
    button.innerHTML = isPlaying ? '⏸️' : '▶️';
}

function createPlayPauseButton() {
    return createButton('▶️');
}

function createWrapper(container) {
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        position: 'relative',
        minWidth: '264px',
        minHeight: '60px'
    });
    container.appendChild(wrapper);
    return wrapper;
}

function createToolbar(wrapper) {
    const toolbarContainer = document.createElement('div');
    Object.assign(toolbarContainer.style, {
        position: 'absolute',
        top: '5px',
        left: '5px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 'calc(100% - 10px)',
        zIndex: '10'
    });
    wrapper.appendChild(toolbarContainer);
    return toolbarContainer;
}

function createShowHideToolbarButton() {
    const settingsButton = createButton('⚙️');
    settingsButton.onclick = (event) => {
        const wrapper = event.currentTarget.closest('div').parentNode;
        const toolbar = wrapper.querySelector('.controls-container');
        toolbar.style.display = toolbar.style.display === 'block' ? 'none' : 'block';
    };
    return settingsButton;
}

function createDescriptionLabel(description, wavesurfer) {
    const descriptionLabel = document.createElement('div');
    descriptionLabel.innerText = description;
    Object.assign(descriptionLabel.style, {
        fontWeight: 'bold',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        color: 'black',
        padding: '5px',
        cursor: 'pointer',
        opacity: '0.9',
        fontSize: '12px',
        marginRight: 'auto',
        borderRadius: '5px' // Rounded corners
    });
    descriptionLabel.onclick = () => togglePlayPause(wavesurfer);
    return descriptionLabel;
}

function createControlsContainer(wavesurfer, playPauseButton, timeRatioContainer) {
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'controls-container';
    Object.assign(controlsContainer.style, {
        display: 'none',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '10px'
    });

    controlsContainer.appendChild(createTransportControls(wavesurfer, playPauseButton));
    controlsContainer.appendChild(createSpeedControlContainer(wavesurfer));
    controlsContainer.appendChild(createVolumeControlContainer(wavesurfer));

    controlsContainer.timeRatioContainer = timeRatioContainer;
    return controlsContainer;
}

function createTransportControls(wavesurfer, playPauseButton) {
    const transportControls = document.createElement('div');
    Object.assign(transportControls.style, {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '10px'
    });

    transportControls.appendChild(createGoToStartButton(wavesurfer));
    transportControls.appendChild(playPauseButton);
    transportControls.appendChild(createLoopButton(wavesurfer));
    transportControls.appendChild(createTimeRatioToggleButton());
    transportControls.appendChild(createSpeedToggleButton());
    transportControls.appendChild(createVolumeToggleButton());

    return transportControls;
}

function createButton(icon) {
    const button = document.createElement('button');
    Object.assign(button.style, {
        background: 'white',
        border: '1px solid black',
        borderRadius: '4px',
        cursor: 'pointer',
        padding: '5px'
    });
    button.innerHTML = icon;
    return button;
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
        const speedControlContainer = controlsContainer.querySelector('.speed-control-container');
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
        const volumeControlContainer = controlsContainer.querySelector('.volume-control-container');
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
    speedControlContainer.className = 'speed-control-container';
    Object.assign(speedControlContainer.style, {
        display: 'none',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: '10px',
        width: '100%'
    });

    const speedLabel = createButton('⏱️');
    speedLabel.style.marginRight = '10px';
    speedControlContainer.appendChild(speedLabel);

    const speedControlWrapper = document.createElement('div');
    Object.assign(speedControlWrapper.style, {
        flex: '1',
        display: 'flex',
        alignItems: 'center'
    });
    speedControlContainer.appendChild(speedControlWrapper);

    const speedControl = createSpeedControl(wavesurfer);
    speedControlWrapper.appendChild(speedControl);

    const speedReadout = createSpeedReadout();
    speedControlWrapper.appendChild(speedReadout);

    speedLabel.onclick = () => {
        speedControl.value = 50;
        wavesurfer.setPlaybackRate(1);
        speedReadout.innerHTML = '1.00x';
    };

    return speedControlContainer;
}

function createSpeedControl(wavesurfer) {
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
        const speedReadout = speedControl.parentNode.querySelector('.speed-readout');
        speedReadout.innerHTML = actualSpeed.toFixed(2) + 'x';
    };
    return speedControl;
}

function createSpeedReadout() {
    const speedReadout = document.createElement('span');
    speedReadout.className = 'speed-readout';
    speedReadout.innerHTML = '1.00x';
    Object.assign(speedReadout.style, {
        fontFamily: 'monospace',
        fontSize: '12px',
        marginLeft: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Light label background
        color: 'black', // Black text color
        borderRadius: '5px' // Rounded corners
    });
    return speedReadout;
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
    volumeControlContainer.className = 'volume-control-container';
    Object.assign(volumeControlContainer.style, {
        display: 'none',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%'
    });

    const volumeLabel = createButton('🔊');
    volumeLabel.style.marginRight = '10px';
    volumeControlContainer.appendChild(volumeLabel);

    const volumeControlWrapper = document.createElement('div');
    Object.assign(volumeControlWrapper.style, {
        flex: '1',
        display: 'flex',
        alignItems: 'center'
    });
    volumeControlContainer.appendChild(volumeControlWrapper);

    const volumeControl = createVolumeControl(wavesurfer);
    volumeControlWrapper.appendChild(volumeControl);

    const volumeReadout = createVolumeReadout();
    volumeControlWrapper.appendChild(volumeReadout);

    volumeLabel.onclick = () => {
        volumeControl.value = 1;
        wavesurfer.setVolume(1);
        volumeReadout.innerHTML = '100%';
    };

    return volumeControlContainer;
}

function createVolumeControl(wavesurfer) {
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
        const volumeReadout = volumeControl.parentNode.querySelector('span');
        volumeReadout.innerHTML = padVolume((volumeControl.value * 100).toFixed(0)) + '%';
    };
    return volumeControl;
}

function createVolumeReadout() {
    const volumeReadout = document.createElement('span');
    volumeReadout.innerHTML = padVolume('100%');
    Object.assign(volumeReadout.style, {
        fontFamily: 'monospace',
        fontSize: '12px',
        marginLeft: '10px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)', // Light label background
        color: 'black', // Black text color
        borderRadius: '5px' // Rounded corners
    });
    return volumeReadout;
}

function createTimeRatioContainer(wrapper) {
    const timeRatioContainer = document.createElement('div');
    timeRatioContainer.className = 'time-ratio-container';
    Object.assign(timeRatioContainer.style, {
        display: 'none', // Hide by default
        position: 'absolute',
        top: '35px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '5px',
        borderRadius: '5px',
        textAlign: 'center',
        fontSize: '10px',
        whiteSpace: 'nowrap',
        lineHeight: '1', // Set to 1 for the height to match the font size
        zIndex: '20' // Ensure it is rendered over the waveform
    });

    const ratioLabel = createRatioLabel();
    timeRatioContainer.appendChild(ratioLabel);

    wrapper.appendChild(timeRatioContainer);

    timeRatioContainer.ratioLabel = ratioLabel;

    // Pass clicks through the time ratio container to the waveform
    timeRatioContainer.onclick = event => {
        event.stopPropagation();
    };

    return timeRatioContainer;
}

function createRatioLabel() {
    const ratioLabel = document.createElement('span');
    ratioLabel.className = 'ratio-label';
    Object.assign(ratioLabel.style, {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: 'black' // Black text color
    });
    return ratioLabel;
}

function updateCurrentTime(wavesurfer, timeRatioContainer) {
    const currentTime = wavesurfer.getCurrentTime();
    timeRatioContainer.ratioLabel.innerHTML = formatTime(currentTime) + ' / ' + formatTime(wavesurfer.getDuration());
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

// Docsify plugin integration
window.$docsify.plugins = [].concat(function (hook, vm) {
    hook.doneEach(() => {
        initWaveSurfer();
    });
}, window.$docsify.plugins);
