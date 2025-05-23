// DiceCut MVP Script
// Core logic: Audio upload, waveform, video recording, dice edit simulation, preview, export

// Globals
let audioBuffer = null;
let audioUrl = '';
let videoStreams = Array(10).fill(null);
let videoBlobs = Array(10).fill(null);
let mediaRecorders = Array(10).fill(null);
let isRecording = Array(10).fill(false);
let audioContext = null;

// DOM Elements
const audioInput = document.getElementById('audio-upload');
const waveformDiv = document.getElementById('waveform');
const videosGrid = document.getElementById('videos-grid');
const fullDiceBtn = document.getElementById('full-dice-btn');
const barDiceBtn = document.getElementById('bar-dice-btn');
const outputVideo = document.getElementById('output-video');
const exportBtn = document.getElementById('export-btn');

// Utils
function createWaveform(file) {
    // Simple waveform placeholder: show filename for now
    waveformDiv.innerHTML = `<div class="waveform-placeholder">Waveform: ${file.name}</div>`;
}

// Audio Upload Handler
audioInput.addEventListener('change', async function () {
    if (!audioInput.files[0]) return;
    const file = audioInput.files[0];
    audioUrl = URL.createObjectURL(file);
    createWaveform(file);

    // Load into AudioContext for precise timing, waveform, etc.
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
});

// Generate 10 Video Tracks UI
function createVideoTracks() {
    for (let i = 0; i < 10; i++) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'video-track';
        trackDiv.dataset.track = i;

        const videoEl = document.createElement('video');
        videoEl.setAttribute('playsinline', true);
        videoEl.setAttribute('controls', true);
        videoEl.id = `video-take-${i}`;
        trackDiv.appendChild(videoEl);

        const recBtn = document.createElement('button');
        recBtn.className = 'record-btn';
        recBtn.textContent = 'Record';
        recBtn.onclick = () => handleRecord(i, recBtn, videoEl);
        trackDiv.appendChild(recBtn);

        videosGrid.appendChild(trackDiv);
    }
}
createVideoTracks();

// Video Recording Handler
async function handleRecord(trackIdx, btn, videoEl) {
    if (isRecording[trackIdx]) {
        // Stop recording
        mediaRecorders[trackIdx]?.stop();
        btn.textContent = 'Record';
        btn.classList.remove('recording');
        isRecording[trackIdx] = false;
        return;
    }

    // Request camera access
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoStreams[trackIdx] = stream;
    } catch (e) {
        alert('Camera access denied!');
        return;
    }

    // Countdown, then start
    btn.textContent = '3';
    await new Promise(res => setTimeout(res, 400));
    btn.textContent = '2';
    await new Promise(res => setTimeout(res, 400));
    btn.textContent = '1';
    await new Promise(res => setTimeout(res, 400));
    btn.textContent = 'Recording...';
    btn.classList.add('recording');
    isRecording[trackIdx] = true;

    // Play audio if available
    let audio;
    if (audioUrl) {
        audio = new Audio(audioUrl);
        audio.play();
    }

    // Start recording
    let chunks = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorders[trackIdx] = recorder;
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        videoBlobs[trackIdx] = blob;
        videoEl.src = URL.createObjectURL(blob);
        stream.getTracks().forEach(track => track.stop());
        btn.textContent = 'Record';
        btn.classList.remove('recording');
        isRecording[trackIdx] = false;
        if (audio) audio.pause();
    };
    recorder.start();

    // Stop after audio ends or 30s max
    let duration = audioBuffer ? audioBuffer.duration * 1000 : 30000;
    setTimeout(() => {
        if (isRecording[trackIdx]) recorder.stop();
    }, duration);
}

// Dice Edit: Simulate Random Cuts
function diceEdit(fullSong = true) {
    // For MVP: randomly select video takes in sequence, join segments for a "dice" edit
    if (!videoBlobs.some(Boolean)) {
        alert('Record at least one video take.');
        return;
    }
    let segmentCount = fullSong ? 30 : 4; // Full = 30 segments, else 4 (8-bar)
    let selectedTakes = [];
    for (let i = 0; i < segmentCount; i++) {
        // Pick a random video take that exists
        const available = videoBlobs.map((b, idx) => b ? idx : null).filter(i => i !== null);
        selectedTakes.push(available[Math.floor(Math.random() * available.length)]);
    }
    // Simulate "edit": just play the first available take for now
    const first = videoBlobs[selectedTakes[0]];
    if (first) outputVideo.src = URL.createObjectURL(first);
    outputVideo.load();
}

// Event Listeners for Dice Buttons
fullDiceBtn.addEventListener('click', () => diceEdit(true));
barDiceBtn.addEventListener('click', () => diceEdit(false));

// Export Handler
exportBtn.addEventListener('click', () => {
    if (!outputVideo.src) {
        alert('Nothing to export!');
        return;
    }
    const a = document.createElement('a');
    a.href = outputVideo.src;
    a.download = 'dicecut-music-video.webm';
    a.click();
});
