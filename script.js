// === Timeline & Waveform Logic ===
const SEGMENT_BAR_COUNT = 8;
const TOTAL_SEGMENTS = 9;
const SEGMENT_LENGTH_SEC = 16;

let segmentLocks = Array(TOTAL_SEGMENTS).fill(false);
let currentAudioDuration = SEGMENT_LENGTH_SEC * TOTAL_SEGMENTS;
let wavesurfer;
let barsOverlay = document.getElementById('bars-overlay');

// --- Dicecut state (stub logic, expand for real use) ---
let currentSegment = 0; // index of the first unlocked segment

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
  // Randomize all unlocked segments
  alert('🎲 Dicecut All: Randomly edit the entire video (all unlocked segments).');
}
function dicecutNext8Bars() {
  // Find first unlocked segment
  const index = segmentLocks.findIndex(l => !l);
  if (index === -1) {
    alert("All segments are locked!");
    return;
  }
  alert(`🎲 Dicecut: Randomly edit bars ${index * SEGMENT_BAR_COUNT + 1}-${(index + 1) * SEGMENT_BAR_COUNT}`);
  // After artist is satisfied, they can lock this segment!
}
document.getElementById('dicecut-all-btn').onclick = dicecutAll;
document.getElementById('dicecut-8bars-btn').onclick = dicecutNext8Bars;

// === Video Track Monitors (same as before, for continuity) ===
const VIDEO_TRACKS = 10;
let cameraStream = null;
let activeTrackIndex = null;
let mediaRecorders = Array(VIDEO_TRACKS).fill(null);
let recordedBlobs = Array(VIDEO_TRACKS).fill(null);
let countdownTimer = null;
const videoTracksContainer = document.getElementById('video-tracks-container');
function renderVideoTracks() {
  videoTracksContainer.innerHTML = '';
  for (let i = 0; i < VIDEO_TRACKS; i++) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'video-track';
    trackDiv.dataset.index = i;
    const label = document.createElement('div');
    label.className = 'video-label';
    label.textContent = `Track ${i + 1}`;
    trackDiv.appendChild(label);
    const video = document.createElement('video');
    video.className = 'video-monitor';
    video.autoplay = false;
    video.playsInline = true;
    video.controls = false;
    video.muted = true;
    video.setAttribute('data-index', i);
    if (recordedBlobs[i]) {
      video.src = URL.createObjectURL(recordedBlobs[i]);
      video.controls = true;
      video.autoplay = false;
    } else {
      video.src = "";
      video.poster = "";
    }
    trackDiv.appendChild(video);
    const btnRow = document.createElement('div');
    btnRow.style.display = "flex";
    btnRow.style.alignItems = "center";
    const selectBtn = document.createElement('button');
    selectBtn.className = 'select-btn';
    selectBtn.textContent = (activeTrackIndex === i) ? "Selected" : "Select";
    selectBtn.disabled = (activeTrackIndex === i);
    selectBtn.onclick = () => armCameraForTrack(i);
    btnRow.appendChild(selectBtn);
    if (activeTrackIndex === i) {
      const recordBtn = document.createElement('button');
      recordBtn.className = 'record-btn';
      recordBtn.textContent = "Start Recording";
      recordBtn.onclick = () => startCountdownAndRecord(i);
      btnRow.appendChild(recordBtn);
    }
    trackDiv.appendChild(btnRow);
    if (trackDiv.dataset.countdown) {
      const countdown = document.createElement('div');
      countdown.className = 'countdown-overlay';
      countdown.textContent = trackDiv.dataset.countdown;
      trackDiv.appendChild(countdown);
    }
    if (trackDiv.dataset.rec === "1") {
      const rec = document.createElement('div');
      rec.className = 'rec-indicator';
      rec.textContent = "● REC";
      trackDiv.appendChild(rec);
    }
    videoTracksContainer.appendChild(trackDiv);
  }
}
async function armCameraForTrack(index) {
  stopCamera();
  activeTrackIndex = index;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const videos = document.querySelectorAll('.video-monitor');
    videos.forEach((vid, idx) => {
      if (idx === index) {
        vid.srcObject = cameraStream;
        vid.autoplay = true;
        vid.muted = true;
        vid.controls = false;
        vid.play();
      } else {
        vid.srcObject = null;
        vid.pause();
      }
    });
  } catch (e) {
    alert('Could not access camera: ' + e.message);
    activeTrackIndex = null;
  }
  renderVideoTracks();
}
function startCountdownAndRecord(index) {
  let count = 3;
  setCountdownOverlay(index, count);
  countdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      setCountdownOverlay(index, count);
    } else {
      clearInterval(countdownTimer);
      setCountdownOverlay(index, null);
      startRecording(index);
    }
  }, 1000);
}
function setCountdownOverlay(index, value) {
  const trackDivs = document.querySelectorAll('.video-track');
  trackDivs.forEach((div, idx) => {
    if (idx === index) {
      if (value) {
        div.dataset.countdown = value;
      } else {
        delete div.dataset.countdown;
      }
    } else {
      delete div.dataset.countdown;
    }
  });
  renderVideoTracks();
}
function startRecording(index) {
  if (!cameraStream) return;
  let options = { mimeType: 'video/webm; codecs=vp9' };
  let mediaRecorder;
  let recordedChunks = [];
  try {
    mediaRecorder = new MediaRecorder(cameraStream, options);
  } catch (e) {
    alert('MediaRecorder error: ' + e.message);
    return;
  }
  mediaRecorders[index] = mediaRecorder;
  setRecIndicator(index, true);
  mediaRecorder.ondataavailable = function(e) {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  mediaRecorder.onstop = function() {
    setRecIndicator(index, false);
    recordedBlobs[index] = new Blob(recordedChunks, { type: 'video/webm' });
    stopCamera();
    renderVideoTracks();
  };
  mediaRecorder.start();
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }, 10000);
}
function setRecIndicator(index, isRec) {
  const trackDivs = document.querySelectorAll('.video-track');
  trackDivs.forEach((div, idx) => {
    if (idx === index) {
      if (isRec) div.dataset.rec = "1";
      else delete div.dataset.rec;
    } else {
      delete div.dataset.rec;
    }
  });
  renderVideoTracks();
}
function stopCamera() {
  if (cameraStream) {
    let tracks = cameraStream.getTracks();
    tracks.forEach(t => t.stop());
    cameraStream = null;
  }
  activeTrackIndex = null;
  renderVideoTracks();
}
window.addEventListener('DOMContentLoaded', () => {
  renderBarsOverlay(currentAudioDuration);
  renderVideoTracks();
});
