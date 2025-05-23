let wavesurfer = null;
let audioUrl = '';
let audioBuffer = null;
let duration = 0;
let barCount = 0;
let barRegions = [];
let bpm = 120; // Default
let barsPerChunk = 8;
let isRecPlayMode = false;
let currentRecordingTrack = null;
let videoBlobs = Array(10).fill(null);
let isRecording = Array(10).fill(false);
let currentSelectedTrack = null;

// DOM
const audioInput = document.getElementById('audio-upload');
const playBtn = document.getElementById('play-btn');
const pauseBtn = document.getElementById('pause-btn');
const stopBtn = document.getElementById('stop-btn');
const recPlayBtn = document.getElementById('rec-play-btn');
const waveformDiv = document.getElementById('waveform');
const videosGrid = document.getElementById('videos-grid');
const fullDiceBtn = document.getElementById('full-dice-btn');
const barDiceBtn = document.getElementById('bar-dice-btn');
const outputVideo = document.getElementById('output-video');
const exportBtn = document.getElementById('export-btn');
const exportFormat = document.getElementById('export-format');
const exportResolution = document.getElementById('export-resolution');
const trackSelect = document.getElementById('video-track-select');
const deselectBtn = document.getElementById('deselect-btn');
const mainRecordBtn = document.getElementById('main-record-btn');

// --- AUDIO & WAVEFORM LOADING ---
audioInput.addEventListener('change', async function () {
    if (!audioInput.files[0]) return;
    const file = audioInput.files[0];
    audioUrl = URL.createObjectURL(file);

    // Load into AudioContext for timing
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    duration = audioBuffer.duration;

    // Guess bar count
    barCount = Math.round((duration / 60) * bpm / 4); // 4 beats/bar
    barsPerChunk = 8;

    // WaveSurfer setup
    if (wavesurfer) wavesurfer.destroy();
    wavesurfer = WaveSurfer.create({
        container: waveformDiv,
        waveColor: '#b39ddb',
        progressColor: '#ff6b6b',
        barWidth: 2,
        height: 70,
        responsive: true,
        plugins: [
            WaveSurfer.regions.create()
        ]
    });
    wavesurfer.load(audioUrl);

    // Add 8-bar regions
    wavesurfer.on('ready', () => {
        drawBarRegions();
        enableWaveformControls();
    });
});

// --- WAVEFORM CONTROLS ---
function enableWaveformControls() {
    playBtn.disabled = false;
    pauseBtn.disabled = false;
    stopBtn.disabled = false;
    recPlayBtn.disabled = false;
}
playBtn.onclick = () => { isRecPlayMode = false; wavesurfer.play(); };
pauseBtn.onclick = () => wavesurfer.pause();
stopBtn.onclick = () => wavesurfer.stop();
recPlayBtn.onclick = () => {
    isRecPlayMode = true;
    wavesurfer.seekTo(0);
    wavesurfer.play();
};

// --- BAR CHUNK REGIONS ---
function drawBarRegions() {
    // Remove old
    wavesurfer.clearRegions();
    barRegions = [];
    let secPerBar = 60 / bpm * 4;
    let regionCount = Math.ceil(barCount / barsPerChunk);
    for (let i = 0; i < regionCount; i++) {
        let start = i * barsPerChunk * secPerBar;
        let end = Math.min((i + 1) * barsPerChunk * secPerBar, duration);
        let region = wavesurfer.addRegion({
            start: start,
            end: end,
            color: (i % 2 === 0) ? 'rgba(255,205,56,0.13)' : 'rgba(84, 19, 136, 0.08)',
            drag: false,
            resize: false
        });
        barRegions.push(region);
    }
}

// --- VIDEO TRACK SELECTOR ---
function populateTrackSelector() {
    trackSelect.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Take ${i + 1}` + (videoBlobs[i] ? " (✔)" : "");
        trackSelect.appendChild(opt);
    }
    // Default: select track 0
    if (currentSelectedTrack === null) {
        currentSelectedTrack = 0;
        trackSelect.value = "0";
    } else {
        trackSelect.value = currentSelectedTrack;
    }
}
trackSelect.addEventListener('change', () => {
    currentSelectedTrack = parseInt(trackSelect.value, 10);
    createVideoTracks();
});
deselectBtn.addEventListener('click', () => {
    currentSelectedTrack = null;
    trackSelect.value = "";
    createVideoTracks();
});
mainRecordBtn.addEventListener('click', () => {
    if (currentSelectedTrack === null) {
        alert("Select a video take to record.");
        return;
    }
    // Find button in shown video track
    const recBtn = document.querySelector('.video-track .record-btn');
    if (recBtn) recBtn.click();
});

// --- VIDEO TRACKS UI ---
function createVideoTracks() {
    videosGrid.innerHTML = '';
    populateTrackSelector();

    if (currentSelectedTrack === null) {
        // Show nothing if none selected
        return;
    }
    let i = currentSelectedTrack;
    const trackDiv = document.createElement('div');
    trackDiv.className = 'video-track';
    trackDiv.dataset.track = i;

    // Track label
    const label = document.createElement('span');
    label.className = 'track-label';
    label.textContent = `Take ${i + 1}`;
    trackDiv.appendChild(label);

    // Recording indicator
    const recInd = document.createElement('span');
    recInd.className = 'recording-indicator';
    recInd.textContent = '● Recording...';
    trackDiv.appendChild(recInd);

    // Thumbnail preview
    const thumb = document.createElement('img');
    thumb.className = 'thumb-preview hidden';
    thumb.alt = 'Preview';
    if (videoBlobs[i]) {
        thumb.src = URL.createObjectURL(videoBlobs[i]);
        thumb.classList.remove('hidden');
    }
    trackDiv.appendChild(thumb);

    // Video element (hidden until has blob)
    const videoEl = document.createElement('video');
    videoEl.setAttribute('playsinline', true);
    videoEl.setAttribute('controls', true);
    videoEl.id = `video-take-${i}`;
    videoEl.style.display = videoBlobs[i] ? '' : 'none';
    if (videoBlobs[i]) videoEl.src = URL.createObjectURL(videoBlobs[i]);
    trackDiv.appendChild(videoEl);

    // Record button
    const recBtn = document.createElement('button');
    recBtn.className = 'record-btn';
    recBtn.textContent = videoBlobs[i] ? 'Re-record' : 'Record';
    recBtn.onclick = () => handleRecord(i, recBtn, videoEl, thumb, trackDiv, recInd);
    if (isRecording[i]) recBtn.classList.add('recording');
    trackDiv.appendChild(recBtn);

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-btn';
    delBtn.innerHTML = '🗑️';
    delBtn.title = 'Delete this take';
    delBtn.onclick = () => deleteTake(i, videoEl, recBtn, thumb, trackDiv);
    delBtn.style.display = videoBlobs[i] ? '' : 'none';
    trackDiv.appendChild(delBtn);

    // Set .recording class if this track is recording
    if (isRecording[i]) trackDiv.classList.add('recording');

    videosGrid.appendChild(trackDiv);
}
createVideoTracks(); // On load
populateTrackSelector();

// --- VIDEO RECORDING HANDLER ---
async function handleRecord(trackIdx, btn, videoEl, thumb, trackDiv, recInd) {
    // Prevent double recording
    if (isRecording[trackIdx]) return;

    // Camera access
    let stream;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (e) {
        alert('Camera access denied!');
        return;
    }

    // Highlight UI
    btn.textContent = 'Recording...';
    btn.classList.add('recording');
    btn.disabled = true;
    trackDiv.classList.add('recording');
    recInd.style.display = 'block';
    isRecording[trackIdx] = true;
    currentRecordingTrack = trackIdx;

    // Hide video/thumbnail during recording
    videoEl.style.display = 'none';
    thumb.classList.add('hidden');

    // Play audio in "record mode"
    let audioPlay;
    if (audioUrl) {
        audioPlay = new Audio(audioUrl);
        audioPlay.currentTime = 0;
        audioPlay.play();
    }

    // Start recording
    let chunks = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        videoBlobs[trackIdx] = blob;
        videoEl.src = URL.createObjectURL(blob);
        videoEl.style.display = '';
        // Thumbnail
        thumb.src = URL.createObjectURL(blob);
        thumb.classList.remove('hidden');
        btn.textContent = 'Re-record';
        btn.disabled = false;
        btn.classList.remove('recording');
        isRecording[trackIdx] = false;
        currentRecordingTrack = null;
        stream.getTracks().forEach(track => track.stop());
        trackDiv.classList.remove('recording');
        recInd.style.display = 'none';
        trackDiv.querySelector('.delete-btn').style.display = '';
        if (audioPlay) audioPlay.pause();
        populateTrackSelector();
    };
    recorder.start();

    // Stop after audio ends or 30s max
    let recDuration = audioBuffer ? audioBuffer.duration * 1000 : 30000;
    setTimeout(() => {
        if (isRecording[trackIdx]) recorder.stop();
    }, recDuration);
}

// DELETE TAKE
function deleteTake(idx, videoEl, recBtn, thumb, trackDiv) {
    videoBlobs[idx] = null;
    videoEl.src = '';
    videoEl.style.display = 'none';
    recBtn.textContent = 'Record';
    thumb.src = '';
    thumb.classList.add('hidden');
    trackDiv.querySelector('.delete-btn').style.display = 'none';
    trackDiv.classList.remove('recording');
    isRecording[idx] = false;
    populateTrackSelector();
}

// DICE EDIT (SIMULATED FOR NOW)
function diceEdit(fullSong = true) {
    if (!videoBlobs.some(Boolean)) {
        alert('Record at least one video take.');
        return;
    }
    let segmentCount = fullSong ? Math.ceil(barCount / barsPerChunk) : 1;
    let selectedTakes = [];
    for (let i = 0; i < segmentCount; i++) {
        const available = videoBlobs.map((b, idx) => b ? idx : null).filter(i => i !== null);
        selectedTakes.push(available[Math.floor(Math.random() * available.length)]);
    }
    // For MVP, just show the first selected take
    const first = videoBlobs[selectedTakes[0]];
    if (first) outputVideo.src = URL.createObjectURL(first);
    outputVideo.load();
}
fullDiceBtn.onclick = () => diceEdit(true);
barDiceBtn.onclick = () => diceEdit(false);

// EXPORT
exportBtn.onclick = () => {
    if (!outputVideo.src) {
        alert('Nothing to export!');
        return;
    }
    const a = document.createElement('a');
    a.href = outputVideo.src;
    a.download = `dicecut-music-video.${exportFormat.value}`;
    a.click();
};

// Responsive: re-create video tracks on resize for optimal size
window.addEventListener('resize', createVideoTracks);
