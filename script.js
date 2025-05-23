// Globals
let wavesurfer = null;
let audioUrl = '';
let audioBuffer = null;
let duration = 0;
let barCount = 0;
let barRegions = [];
let bpm = 120; // Default, can be user input for more accuracy
let barsPerChunk = 8;
let isRecPlayMode = false;
let currentRecordingTrack = null;
let videoBlobs = Array(10).fill(null);
let isRecording = Array(10).fill(false);

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

// --- AUDIO & WAVEFORM LOADING ---
audioInput.addEventListener('change', async function () {
    if (!audioInput.files[0]) return;
    const file = audioInput.files[0];
    audioUrl = URL.createObjectURL(file);

    // Load into AudioContext for precise timing if needed
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    duration = audioBuffer.duration;

    // Guess bar count (user can edit BPM support later)
    barCount = Math.round((duration / 60) * bpm / 4); // 4 beats per bar
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

    // When ready, add 8-bar regions
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
            color: (i % 2 === 0) ? 'rgba(255,205,56,0.08)' : 'rgba(255,107,107,0.09)',
            drag: false,
            resize: false
        });
        barRegions.push(region);
    }
}

// --- VIDEO TRACKS UI ---
function createVideoTracks() {
    videosGrid.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'video-track';
        trackDiv.dataset.track = i;

        // Track label
        const label = document.createElement('span');
        label.className = 'track-label';
        label.textContent = `Take ${i + 1}`;
        trackDiv.appendChild(label);

        // Video element
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
        recBtn.onclick = () => handleRecord(i, recBtn, videoEl, trackDiv);
        trackDiv.appendChild(recBtn);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.title = 'Delete this take';
        delBtn.onclick = () => deleteTake(i, videoEl, recBtn, trackDiv);
        delBtn.style.display = videoBlobs[i] ? '' : 'none';
        trackDiv.appendChild(delBtn);

        videosGrid.appendChild(trackDiv);
    }
}
createVideoTracks();

// --- VIDEO RECORDING HANDLER ---
async function handleRecord(trackIdx, btn, videoEl, trackDiv) {
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
    btn.disabled = true;
    trackDiv.classList.add('recording');
    isRecording[trackIdx] = true;
    currentRecordingTrack = trackIdx;

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
        btn.textContent = 'Re-record';
        btn.disabled = false;
        isRecording[trackIdx] = false;
        currentRecordingTrack = null;
        stream.getTracks().forEach(track => track.stop());
        trackDiv.classList.remove('recording');
        trackDiv.querySelector('.delete-btn').style.display = '';
        if (audioPlay) audioPlay.pause();
    };
    recorder.start();

    // Stop after audio ends or 30s max
    let recDuration = audioBuffer ? audioBuffer.duration * 1000 : 30000;
    setTimeout(() => {
        if (isRecording[trackIdx]) recorder.stop();
    }, recDuration);
}

// --- DELETE TAKE ---
function deleteTake(idx, videoEl, recBtn, trackDiv) {
    videoBlobs[idx] = null;
    videoEl.src = '';
    videoEl.style.display = 'none';
    recBtn.textContent = 'Record';
    trackDiv.querySelector('.delete-btn').style.display = 'none';
}

// --- DICE EDIT (SIMULATED FOR NOW) ---
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

// --- EXPORT ---
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

// --- Re-create video tracks on resize for better layout ---
window.addEventListener('resize', createVideoTracks);
