// DiceCut Enhanced MVP Script
// Visual improvements, real waveform, dynamic progress, thumbnails, countdown, help overlay, re-record/delete, better mobile, export options

let audioBuffer = null;
let audioUrl = '';
let videoStreams = Array(10).fill(null);
let videoBlobs = Array(10).fill(null);
let mediaRecorders = Array(10).fill(null);
let isRecording = Array(10).fill(false);
let audioContext = null;
let progressStep = 0;
let recordedCount = 0;

// DOM Elements
const audioInput = document.getElementById('audio-upload');
const waveformDiv = document.getElementById('waveform');
const videosGrid = document.getElementById('videos-grid');
const fullDiceBtn = document.getElementById('full-dice-btn');
const barDiceBtn = document.getElementById('bar-dice-btn');
const outputVideo = document.getElementById('output-video');
const exportBtn = document.getElementById('export-btn');
const exportFormat = document.getElementById('export-format');
const exportResolution = document.getElementById('export-resolution');
const exportProgress = document.getElementById('export-progress');
const progressFill = document.querySelector('.progress-fill');
const progressIndicator = document.getElementById('progress-indicator');
const helpBtn = document.getElementById('help-btn');
const helpOverlay = document.getElementById('help-overlay');
const closeHelp = document.getElementById('close-help');

// --- 1. Visual: Real Waveform with wavesurfer.js
let wavesurfer = null;
function createWaveform(file) {
    if (wavesurfer) wavesurfer.destroy();
    waveformDiv.innerHTML = '';
    wavesurfer = WaveSurfer.create({
        container: waveformDiv,
        waveColor: '#b39ddb',
        progressColor: '#ff6b6b',
        barWidth: 2,
        height: 60,
        responsive: true
    });
    const url = URL.createObjectURL(file);
    wavesurfer.load(url);
}

// --- 2. User Guidance and Progress
function updateProgress() {
    recordedCount = videoBlobs.filter(Boolean).length;
    if (!audioUrl) {
        progressIndicator.textContent = 'Step 1: Upload your song 🎵';
    } else if (recordedCount < 1) {
        progressIndicator.textContent = 'Step 2: Record your first video take';
    } else if (recordedCount < 10) {
        progressIndicator.textContent = `Step 2: Record your video takes (${recordedCount}/10 recorded)`;
    } else {
        progressIndicator.textContent = 'Step 3: Try Dice Edit or Export your music video!';
    }
}

// --- 3. Video Recording with Countdown, Thumbnails, Delete, Re-record
function createVideoTracks() {
    videosGrid.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'video-track';
        trackDiv.dataset.track = i;

        // Thumbnail Preview
        const thumb = document.createElement('img');
        thumb.className = 'thumb-preview';
        thumb.alt = 'Preview';
        thumb.style.display = 'none';
        trackDiv.appendChild(thumb);

        // Countdown
        const countdown = document.createElement('span');
        countdown.className = 'countdown';
        countdown.style.display = 'none';
        trackDiv.appendChild(countdown);

        // Video Element
        const videoEl = document.createElement('video');
        videoEl.setAttribute('playsinline', true);
        videoEl.setAttribute('controls', true);
        videoEl.id = `video-take-${i}`;
        videoEl.style.display = 'none';
        trackDiv.appendChild(videoEl);

        // Record Button
        const recBtn = document.createElement('button');
        recBtn.className = 'record-btn';
        recBtn.textContent = 'Record';
        recBtn.onclick = () => handleRecord(i, recBtn, videoEl, thumb, countdown, trackDiv);
        trackDiv.appendChild(recBtn);

        // Delete/Re-record Button
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '⟲';
        delBtn.title = 'Delete/Redo this take';
        delBtn.onclick = () => deleteTake(i, videoEl, thumb, recBtn, trackDiv);
        delBtn.style.display = 'none';
        trackDiv.appendChild(delBtn);

        // Show preview if exists
        if (videoBlobs[i]) {
            thumb.src = URL.createObjectURL(videoBlobs[i]);
            thumb.style.display = '';
            videoEl.src = URL.createObjectURL(videoBlobs[i]);
            videoEl.style.display = '';
            recBtn.textContent = 'Re-record';
            delBtn.style.display = '';
        }

        videosGrid.appendChild(trackDiv);
    }
}

// --- Video Recording Handler (with Countdown)
async function handleRecord(trackIdx, btn, videoEl, thumb, countdown, trackDiv) {
    if (isRecording[trackIdx]) {
        mediaRecorders[trackIdx]?.stop();
        return;
    }

    // Camera access
    let stream = null;
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoStreams[trackIdx] = stream;
    } catch (e) {
        alert('Camera access denied!');
        return;
    }

    // Visual highlight
    trackDiv.classList.add('recording');
    btn.classList.add('recording');

    // Countdown
    countdown.style.display = '';
    let count = 3;
    countdown.textContent = count;
    btn.disabled = true;
    for (let i = 0; i < 3; i++) {
        await new Promise(res => setTimeout(res, 500));
        count--;
        countdown.textContent = count > 0 ? count : 'Go!';
    }
    await new Promise(res => setTimeout(res, 400));
    countdown.style.display = 'none';
    btn.disabled = false;

    // Start Recording
    btn.textContent = 'Recording...';
    isRecording[trackIdx] = true;

    // Play audio if available
    let audio;
    if (audioUrl) {
        audio = new Audio(audioUrl);
        audio.currentTime = 0;
        audio.play();
    }

    // Record
    let chunks = [];
    const recorder = new MediaRecorder(stream);
    mediaRecorders[trackIdx] = recorder;
    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        videoBlobs[trackIdx] = blob;
        thumb.src = URL.createObjectURL(blob);
        thumb.style.display = '';
        videoEl.src = URL.createObjectURL(blob);
        videoEl.style.display = '';
        btn.textContent = 'Re-record';
        isRecording[trackIdx] = false;
        stream.getTracks().forEach(track => track.stop());
        trackDiv.classList.remove('recording');
        btn.classList.remove('recording');
        trackDiv.querySelector('.delete-btn').style.display = '';
        if (audio) audio.pause();
        updateProgress();
    };
    recorder.start();

    // Stop after audio ends or 30s max
    let duration = audioBuffer ? audioBuffer.duration * 1000 : 30000;
    setTimeout(() => {
        if (isRecording[trackIdx]) recorder.stop();
    }, duration);
}

function deleteTake(idx, videoEl, thumb, recBtn, trackDiv) {
    videoBlobs[idx] = null;
    videoEl.src = '';
    videoEl.style.display = 'none';
    thumb.src = '';
    thumb.style.display = 'none';
    recBtn.textContent = 'Record';
    trackDiv.querySelector('.delete-btn').style.display = 'none';
    updateProgress();
}

// --- Dice Edit: Simulated for now (randomly selects takes)
function diceEdit(fullSong = true) {
    if (!videoBlobs.some(Boolean)) {
        alert('Record at least one video take.');
        return;
    }
    let segmentCount = fullSong ? 30 : 4;
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

// --- Export: Simulated progress, download current output video
function exportWithProgress() {
    if (!outputVideo.src) {
        alert('Nothing to export!');
        return;
    }
    exportProgress.classList.remove('hidden');
    progressFill.style.width = '0%';
    let progress = 0;
    let intv = setInterval(() => {
        progress += Math.random() * 30 + 10;
        if (progress >= 100) progress = 100;
        progressFill.style.width = progress + '%';
        if (progress === 100) {
            clearInterval(intv);
            setTimeout(() => {
                exportProgress.classList.add('hidden');
                // Download
                const a = document.createElement('a');
                a.href = outputVideo.src;
                a.download = `dicecut-music-video.${exportFormat.value}`;
                a.click();
            }, 400);
        }
    }, 400);
}

// --- Help Overlay
helpBtn.onclick = () => { helpOverlay.classList.remove('hidden'); };
closeHelp.onclick = () => { helpOverlay.classList.add('hidden'); };

// --- Initialization
audioInput.addEventListener('change', async function () {
    if (!audioInput.files[0]) return;
    const file = audioInput.files[0];
    audioUrl = URL.createObjectURL(file);
    createWaveform(file);
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    updateProgress();
});

fullDiceBtn.addEventListener('click', () => diceEdit(true));
barDiceBtn.addEventListener('click', () => diceEdit(false));
exportBtn.addEventListener('click', exportWithProgress);

// Mobile: re-create video tracks on resize for better layout
window.addEventListener('resize', createVideoTracks);

// On page load
createVideoTracks();
updateProgress();
