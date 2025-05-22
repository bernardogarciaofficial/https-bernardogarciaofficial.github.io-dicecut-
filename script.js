const VIDEO_TRACKS = 10;
const SEGMENT_BAR_COUNT = 8;
const TOTAL_SEGMENTS = 9;
const SEGMENT_LENGTH_SEC = 16;

let segmentLocks = Array(TOTAL_SEGMENTS).fill(false);
let currentAudioDuration = SEGMENT_LENGTH_SEC * TOTAL_SEGMENTS;

let cameraStream = null;
let activeTrackIndex = null;
let mediaRecorders = Array(VIDEO_TRACKS).fill(null);
let recordedBlobs = Array(VIDEO_TRACKS).fill(null);
let countdownTimer = null;

// --- VIDEO TRACKS MONITORS ---
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

    // Video Monitor (either preview or playback)
    const video = document.createElement('video');
    video.className = 'video-monitor';
    video.autoplay = false;
    video.playsInline = true;
    video.controls = false;
    video.muted = true;
    video.setAttribute('data-index', i);

    // If we already have a recordedBlob for this track, show it
    if (recordedBlobs[i]) {
      video.src = URL.createObjectURL(recordedBlobs[i]);
      video.controls = true;
      video.autoplay = false;
    } else {
      video.src = ""; // blank
      video.poster = "";
    }

    trackDiv.appendChild(video);

    // Buttons
    const btnRow = document.createElement('div');
    btnRow.style.display = "flex";
    btnRow.style.alignItems = "center";

    // SELECT button
    const selectBtn = document.createElement('button');
    selectBtn.className = 'select-btn';
    selectBtn.textContent = (activeTrackIndex === i) ? "Selected" : "Select";
    selectBtn.disabled = (activeTrackIndex === i);
    selectBtn.onclick = () => armCameraForTrack(i);
    btnRow.appendChild(selectBtn);

    // RECORD button (only if this is the armed track)
    if (activeTrackIndex === i) {
      const recordBtn = document.createElement('button');
      recordBtn.className = 'record-btn';
      recordBtn.textContent = "Start Recording";
      recordBtn.onclick = () => startCountdownAndRecord(i);
      btnRow.appendChild(recordBtn);
    }

    trackDiv.appendChild(btnRow);

    // Attach overlays if needed
    // Countdown
    if (trackDiv.dataset.countdown) {
      const countdown = document.createElement('div');
      countdown.className = 'countdown-overlay';
      countdown.textContent = trackDiv.dataset.countdown;
      trackDiv.appendChild(countdown);
    }
    // REC indicator
    if (trackDiv.dataset.rec === "1") {
      const rec = document.createElement('div');
      rec.className = 'rec-indicator';
      rec.textContent = "● REC";
      trackDiv.appendChild(rec);
    }

    videoTracksContainer.appendChild(trackDiv);
  }
}

// --- CAMERA ARMING ---
async function armCameraForTrack(index) {
  // Stop any previous camera
  stopCamera();
  activeTrackIndex = index;
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    // Show camera preview in the monitor
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

// --- RECORDING FLOW ---
function startCountdownAndRecord(index) {
  // Show countdown overlay
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
    // Stop and clear camera
    stopCamera();
    renderVideoTracks();
  };

  // Record for 10 seconds demo, or add your own stop logic
  mediaRecorder.start();
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  }, 10000); // record for 10 seconds
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

// --- WAVEFORM & OVERLAYS (same as before) ---
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
    region.className = 'lock-segment';
    if (segmentLocks[i]) region.classList.add('locked');
    region.style.left = `${left}%`;
    region.style.width = `${right - left}%`;
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
// Initial empty overlay
window.addEventListener('DOMContentLoaded', () => {
  renderBarsOverlay(currentAudioDuration);
  renderVideoTracks();
});
