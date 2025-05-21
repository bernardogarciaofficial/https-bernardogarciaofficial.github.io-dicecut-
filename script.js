// === Configuration ===

// Number of video tracks
const VIDEO_TRACKS = 10;

// Segment config: 8-bar chunks, 16 seconds per chunk (example), total segments
const SEGMENT_LENGTH_SEC = 16;
const TOTAL_SEGMENTS = 9; // Adjust as needed (e.g., for a typical 2:19 song)

// === DOM Elements ===

const videoTracksContainer = document.getElementById('video-tracks-container');
const segmentsControlsContainer = document.getElementById('segments-controls');
const barSegmentsDiv = document.getElementById('bar-segments');
const audioUpload = document.getElementById('audio-upload');
const audioWaveform = document.getElementById('audio-waveform');
const outputAudioWaveform = document.getElementById('output-audio-waveform');

// === State ===

let segmentLocks = Array(TOTAL_SEGMENTS).fill(false);

// === Render Video Tracks ===

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

// === Render Segment Controls ===

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function renderSegmentsControls() {
  segmentsControlsContainer.innerHTML = '';
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    const startSec = i * SEGMENT_LENGTH_SEC;
    const endSec = startSec + SEGMENT_LENGTH_SEC;
    const label = `${i * 8 + 1}-${(i + 1) * 8} (${formatTime(startSec)}–${formatTime(endSec)})`;

    const segmentDiv = document.createElement('div');
    segmentDiv.className = 'segment-control';
    if (segmentLocks[i]) segmentDiv.classList.add('locked');

    const segmentLabel = document.createElement('div');
    segmentLabel.className = 'segment-label';
    segmentLabel.textContent = label;

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'segment-actions';

    // Play
    const playBtn = document.createElement('button');
    playBtn.textContent = '▶ Play';
    playBtn.onclick = () => alert(`Play segment ${label}`);
    playBtn.disabled = segmentLocks[i];
    actionsDiv.appendChild(playBtn);

    // Rec
    const recBtn = document.createElement('button');
    recBtn.textContent = '⏺ REC';
    recBtn.onclick = () => alert(`Record on segment ${label}`);
    recBtn.disabled = segmentLocks[i];
    actionsDiv.appendChild(recBtn);

    // Stop
    const stopBtn = document.createElement('button');
    stopBtn.textContent = '■ Stop';
    stopBtn.onclick = () => alert(`Stop segment ${label}`);
    actionsDiv.appendChild(stopBtn);

    // Lock/Unlock
    if (!segmentLocks[i]) {
      const lockBtn = document.createElement('button');
      lockBtn.textContent = '🔒 Lock';
      lockBtn.className = 'lock-btn';
      lockBtn.onclick = () => {
        segmentLocks[i] = true;
        renderSegmentsControls();
        renderBarSegments();
      };
      actionsDiv.appendChild(lockBtn);
    } else {
      const unlockBtn = document.createElement('button');
      unlockBtn.textContent = '🔓 Unlock';
      unlockBtn.className = 'unlock-btn';
      unlockBtn.onclick = () => {
        segmentLocks[i] = false;
        renderSegmentsControls();
        renderBarSegments();
      };
      actionsDiv.appendChild(unlockBtn);
    }

    segmentDiv.appendChild(segmentLabel);
    segmentDiv.appendChild(actionsDiv);

    segmentsControlsContainer.appendChild(segmentDiv);
  }
}

renderSegmentsControls();

// === Render Bar Segments Overlay on Audio Timeline ===

function renderBarSegments() {
  // Clear previous
  barSegmentsDiv.innerHTML = '';
  // Calculate width of each segment
  const container = audioWaveform;
  if (!container) return;
  const width = container.offsetWidth || 800;
  const height = container.offsetHeight || 96;
  for (let i = 0; i < TOTAL_SEGMENTS; i++) {
    const segDiv = document.createElement('div');
    segDiv.style.position = 'absolute';
    segDiv.style.left = (i * (100 / TOTAL_SEGMENTS)) + '%';
    segDiv.style.top = '0';
    segDiv.style.width = (100 / TOTAL_SEGMENTS) + '%';
    segDiv.style.height = '100%';
    segDiv.style.borderLeft = i === 0 ? 'none' : '2px solid #b6e356';
    segDiv.style.boxSizing = 'border-box';
    segDiv.style.pointerEvents = 'none';
    segDiv.style.background = segmentLocks[i] ? 'rgba(182,227,86,0.10)' : 'transparent';

    // Label
    const text = document.createElement('span');
    text.textContent = `${i * 8 + 1}-${(i + 1) * 8}`;
    text.style.position = 'absolute';
    text.style.top = '6px';
    text.style.left = '6px';
    text.style.fontSize = '0.95em';
    text.style.color = '#b6e356';
    segDiv.appendChild(text);

    barSegmentsDiv.appendChild(segDiv);
  }
}

// Rerender bars when window resizes (to fit timeline width)
window.addEventListener('resize', renderBarSegments);

// === Audio Waveform Drawing (Basic Placeholder) ===

function drawWaveformPlaceholder(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.offsetWidth || 800;
  const height = canvas.offsetHeight || 96;
  canvas.width = width;
  canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  // Draw some fake waveform lines for now
  ctx.strokeStyle = '#b6e356';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x < width; x += 4) {
    const y = height / 2 + (Math.sin(x / 32) * height / 3) * Math.sin(x / 64);
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

drawWaveformPlaceholder(audioWaveform);
drawWaveformPlaceholder(outputAudioWaveform);

// Re-render waveform and bars after loading
setTimeout(() => {
  drawWaveformPlaceholder(audioWaveform);
  drawWaveformPlaceholder(outputAudioWaveform);
  renderBarSegments();
}, 400);

// === Audio Upload (load waveform) ===
// (Real audio waveform rendering can be integrated with a library like wavesurfer.js)

audioUpload.addEventListener('change', function(event) {
  // TODO: Implement audio waveform visualization
  alert('Audio upload selected (real waveform visualization can be added here)');
});

// === INITIALIZE ===
renderBarSegments();
