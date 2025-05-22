// --- CONFIGURATION ---
const VIDEO_TRACKS = 10;
const SEGMENT_BAR_COUNT = 8; // 8 bars per segment
const TOTAL_SEGMENTS = 9; // for example, covers 72 bars (8*9)
const SEGMENT_LENGTH_SEC = 16; // you may want to calculate this from BPM for real use

// --- STATE ---
let segmentLocks = Array(TOTAL_SEGMENTS).fill(false);
let currentAudioDuration = 0;

// --- VIDEO TRACKS RENDER ---
const videoTracksContainer = document.getElementById('video-tracks-container');
function renderVideoTracks() {
  for (let i = 0; i < VIDEO_TRACKS; i++) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'video-track';

    const label = document.createElement('div');
    label.className = 'video-label';
    label.textContent = `Track ${i + 1}`;
    trackDiv.appendChild(label);

    const inputDiv = document.createElement('div');
    inputDiv.className = 'video-input';
    const videoInput = document.createElement('input');
    videoInput.type = 'file';
    videoInput.accept = 'video/*';
    videoInput.id = `video-upload-${i}`;
    inputDiv.appendChild(videoInput);
    trackDiv.appendChild(inputDiv);

    videoTracksContainer.appendChild(trackDiv);
  }
}
renderVideoTracks();

// --- WAVESURFER SETUP ---
let wavesurfer;
let barsOverlay = document.getElementById('bars-overlay');

function destroyWaveSurfer() {
  if (wavesurfer) {
    try { wavesurfer.destroy(); } catch(e){}
    wavesurfer = null;
  }
  barsOverlay.innerHTML = '';
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// --- BAR & LOCK OVERLAYS ---
function renderBarsOverlay(duration) {
  barsOverlay.innerHTML = '';
  const container = document.getElementById('waveform');
  const width = container.offsetWidth || 800;
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    const startSec = i * SEGMENT_LENGTH_SEC;
    const endSec = Math.min(startSec + SEGMENT_LENGTH_SEC, duration);

    const left = (startSec / duration) * 100;
    const right = (endSec / duration) * 100;
    const region = document.createElement('div');
    region.className = 'lock-region';
    if (segmentLocks[i]) region.classList.add('locked');
    region.style.left = `${left}%`;
    region.style.width = `${right - left}%`;

    // Bar label
    const barLabel = document.createElement('span');
    barLabel.textContent = `${i * SEGMENT_BAR_COUNT + 1}-${(i + 1) * SEGMENT_BAR_COUNT} (${formatTime(startSec)}–${formatTime(endSec)})`;
    barLabel.style.position = 'absolute';
    barLabel.style.left = '8px';
    barLabel.style.top = '8px';
    barLabel.style.color = '#b6e356';
    barLabel.style.fontSize = '0.93em';
    barLabel.style.pointerEvents = 'none';
    region.appendChild(barLabel);

    // Lock/Unlock button
    const lockBtn = document.createElement('button');
    lockBtn.className = 'lock-btn' + (segmentLocks[i] ? ' locked' : '');
    lockBtn.innerHTML = segmentLocks[i] ? '🔒 Locked' : '🔓 Lock';
    lockBtn.onclick = (e) => {
      e.stopPropagation();
      segmentLocks[i] = !segmentLocks[i];
      renderBarsOverlay(duration);
    };
    region.appendChild(lockBtn);

    barsOverlay.appendChild(region);
  }
}

// --- AUDIO UPLOAD + WAVEFORM ---
const audioUpload = document.getElementById('audio-upload');
audioUpload.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (!file) return;
  destroyWaveSurfer();
  wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#b6e356',
    progressColor: '#6c8d3c',
    cursorColor: '#9acd32',
    height: 120,
    barWidth: 2,
    responsive: true,
    normalize: true,
    backend: 'WebAudio'
  });
  wavesurfer.load(URL.createObjectURL(file));
  wavesurfer.on('ready', () => {
    currentAudioDuration = wavesurfer.getDuration();
    renderBarsOverlay(currentAudioDuration);
  });
  // Redraw overlays on resize
  window.addEventListener('resize', () => {
    renderBarsOverlay(currentAudioDuration);
  });
});

// Initial empty overlay (optional, for placeholder)
window.addEventListener('DOMContentLoaded', () => {
  // placeholder for overlay on load
  renderBarsOverlay(SEGMENT_LENGTH_SEC * TOTAL_SEGMENTS);
});
