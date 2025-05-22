// === Timeline & Waveform Logic ===
const SEGMENT_BAR_COUNT = 8;
const TOTAL_SEGMENTS = 9;
const SEGMENT_LENGTH_SEC = 16;

let segmentLocks = Array(TOTAL_SEGMENTS).fill(false);
let currentAudioDuration = SEGMENT_LENGTH_SEC * TOTAL_SEGMENTS;
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

// Render 8-bar overlays and lock buttons inside waveform
function renderBarsOverlay(duration) {
  barsOverlay.innerHTML = '';
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    const startSec = i * SEGMENT_LENGTH_SEC;
    const endSec = Math.min(startSec + SEGMENT_LENGTH_SEC, duration);
    const left = (startSec / duration) * 100;
    const right = (endSec / duration) * 100;
    const region = document.createElement('div');
    region.className = 'lock-segment';
    if (segmentLocks[i]) region.classList.add('locked');
    region.style.left = `${left}%`;
    region.style.width = `${right - left}%`;
    region.style.height = "100%";
    region.style.pointerEvents = "auto";
    // Bar label
    const barLabel = document.createElement('span');
    barLabel.textContent = `${i * SEGMENT_BAR_COUNT + 1}-${(i + 1) * SEGMENT_BAR_COUNT} (${formatTime(startSec)}–${formatTime(endSec)})`;
    barLabel.className = 'segment-label';
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

// --- Audio upload and waveform ---
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
  window.addEventListener('resize', () => {
    renderBarsOverlay(currentAudioDuration);
  });
});
window.addEventListener('DOMContentLoaded', () => {
  renderBarsOverlay(currentAudioDuration);
});

// --- Transport Controls ---
let isPlaying = false;
const playBtn = document.getElementById('play-btn');
const stopBtn = document.getElementById('stop-btn');
playBtn.onclick = () => {
  if (wavesurfer) wavesurfer.play();
  isPlaying = true;
};
stopBtn.onclick = () => {
  if (wavesurfer) wavesurfer.stop();
  isPlaying = false;
};

// --- Dicecut Logic (stub) ---
function dicecutAll() {
  alert('🎲 Dicecut All: Randomly edit the entire video (all unlocked segments).');
}
function dicecutNext8Bars() {
  const index = segmentLocks.findIndex(l => !l);
  if (index === -1) {
    alert("All segments are locked!");
    return;
  }
  alert(`🎲 Dicecut: Randomly edit bars ${index * SEGMENT_BAR_COUNT + 1}-${(index + 1) * SEGMENT_BAR_COUNT}`);
}
document.getElementById('dicecut-all-btn').onclick = dicecutAll;
document.getElementById('dicecut-8bars-btn').onclick = dicecutNext8Bars;

// === Video Track Monitors Logic (if you need it) ===
// -- Existing video track monitor/recording code would go here --
