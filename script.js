// === GLOBAL STATE ===
const TRACK_COUNT = 10;
let masterWavesurfer;
let masterAudioBuffer = null;
let barsPerChunk = 8;
let chunkStates = []; // { locked: bool, rec: bool }
let chunkStartEnd = []; // [{start: seconds, end: seconds, barStart, barEnd}]
let selectedChunk = 0;
let recActiveChunk = null; // Index of currently recording chunk, null if none
let recActiveFinal = false; // Is the OUT screen recording?
let trackStates = Array.from({ length: TRACK_COUNT }, () => ({
  selected: false,
  rec: false,
  wavesurfer: null,
  stream: null,
  recorder: null,
  videoBlob: null,
}));
let selectedTrack = null;
let isRecording = false;
let memberCount = 0;
let trackWaveSurfers = [];
let activeVideoTrack = null;
let mediaStreams = {};

// ==== DOM ELEMENTS ====
const recBtn = document.getElementById('recBtn');
const countdownEl = document.getElementById('countdown');
const memberCountEl = document.getElementById('member-count');
const masterAudioInput = document.getElementById('masterAudioInput');
const loadAudioBtn = document.getElementById('loadAudioBtn');
const masterWaveformEl = document.getElementById('masterWaveform');
const outputWaveformEl = document.getElementById('outputWaveform');
const videoTracksContainer = document.getElementById('video-tracks');

// ==== MEMBER COUNTER SIMULATION ====
function updateMemberCounter() {
  memberCount = Math.floor(Math.random() * 120) + 2;
  memberCountEl.textContent = memberCount;
}
setInterval(updateMemberCounter, 4000);
updateMemberCounter();

// ==== BUILD UI ====
function buildTracksUI() {
  videoTracksContainer.innerHTML = '';
  for (let i = 0; i < TRACK_COUNT; ++i) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'video-track';

    // Audio waveform above video
    const waveformDiv = document.createElement('div');
    waveformDiv.className = 'waveform-container';
    const wsDiv = document.createElement('div');
    wsDiv.className = 'waveform';
    wsDiv.id = `waveform-track-${i}`;
    waveformDiv.appendChild(wsDiv);
    trackDiv.appendChild(waveformDiv);

    // Video element
    const video = document.createElement('video');
    video.width = 280;
    video.height = 180;
    video.autoplay = false;
    video.controls = false;
    video.muted = true;
    video.id = `video-track-${i}`;
    trackDiv.appendChild(video);

    // REC indicator (hidden by default)
    const recIndicator = document.createElement('div');
    recIndicator.className = 'rec-indicator';
    recIndicator.innerText = '● REC';
    recIndicator.style.display = 'none';
    recIndicator.id = `rec-indicator-${i}`;
    trackDiv.appendChild(recIndicator);

    // Select/Deselect Video button
    const selectBtn = document.createElement('button');
    selectBtn.className = 'select-btn';
    selectBtn.innerText = trackStates[i].selected ? 'Deselect Video' : 'Select Video';
    selectBtn.id = `select-btn-${i}`;
    selectBtn.disabled = isRecording || (selectedTrack !== null && selectedTrack !== i);
    selectBtn.onclick = () => handleSelectVideo(i);
    trackDiv.appendChild(selectBtn);

    videoTracksContainer.appendChild(trackDiv);
  }
}
buildTracksUI();

// ==== WAVEFORM SETUP ====
function setupMasterWaveform(audioUrlOrBuffer) {
  if (masterWavesurfer) {
    masterWavesurfer.destroy();
  }
  masterWavesurfer = WaveSurfer.create({
    container: masterWaveformEl,
    waveColor: '#1976d2',
    progressColor: '#c62828',
    height: 60,
  });

  if (typeof audioUrlOrBuffer === 'string') {
    masterWavesurfer.load(audioUrlOrBuffer);
  } else if (audioUrlOrBuffer instanceof AudioBuffer) {
    masterWavesurfer.loadDecodedBuffer(audioUrlOrBuffer);
  }
}

function setupTrackWaveform(idx) {
  const wsDiv = document.getElementById(`waveform-track-${idx}`);
  if (trackWaveSurfers[idx]) {
    trackWaveSurfers[idx].destroy();
  }
  trackWaveSurfers[idx] = WaveSurfer.create({
    container: wsDiv,
    waveColor: '#1976d2',
    progressColor: '#c62828',
    height: 48,
    interact: false,
  });
  // Load the master audio buffer if available
  if (masterAudioBuffer) {
    trackWaveSurfers[idx].loadDecodedBuffer(masterAudioBuffer);
  }
}

function setupOutputWaveform() {
  if (outputWaveformEl.children.length) {
    outputWaveformEl.innerHTML = '';
  }
  let ws = WaveSurfer.create({
    container: outputWaveformEl,
    waveColor: '#1976d2',
    progressColor: '#c62828',
    height: 48,
    interact: false,
  });
  if (masterAudioBuffer) {
    ws.loadDecodedBuffer(masterAudioBuffer);
  }
}

// ==== LOAD AUDIO ====
loadAudioBtn.onclick = async () => {
  if (!masterAudioInput.files[0]) return;
  const file = masterAudioInput.files[0];
  const url = URL.createObjectURL(file);
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  masterAudioBuffer = await ctx.decodeAudioData(arrayBuffer);
  setupMasterWaveform(url);
  for (let i = 0; i < TRACK_COUNT; ++i) {
    setupTrackWaveform(i);
  }
  setupOutputWaveform();
  recBtn.disabled = false;
};

// ==== SELECT VIDEO LOGIC ====
async function handleSelectVideo(idx) {
  if (isRecording) return;
  if (!trackStates[idx].selected) {
    // Deselect others
    for (let i = 0; i < TRACK_COUNT; ++i) {
      trackStates[i].selected = false;
      document.getElementById(`select-btn-${i}`).disabled = false;
      document.getElementById(`select-btn-${i}`).innerText = 'Select Video';
      if (trackStates[i].stream) {
        stopVideoStream(i);
      }
    }
    // Select current
    trackStates[idx].selected = true;
    document.getElementById(`select-btn-${idx}`).innerText = 'Deselect Video';
    document.getElementById(`select-btn-${idx}`).disabled = false;
    for (let i = 0; i < TRACK_COUNT; ++i) {
      if (i !== idx) {
        document.getElementById(`select-btn-${i}`).disabled = true;
      }
    }
    // Get camera
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      trackStates[idx].stream = stream;
      const videoEl = document.getElementById(`video-track-${idx}`);
      videoEl.srcObject = stream;
      videoEl.muted = true;
      videoEl.play();
      selectedTrack = idx;
    } catch (err) {
      alert('Camera access denied.');
      trackStates[idx].selected = false;
      document.getElementById(`select-btn-${idx}`).innerText = 'Select Video';
      for (let i = 0; i < TRACK_COUNT; ++i) {
        document.getElementById(`select-btn-${i}`).disabled = false;
      }
    }
  } else {
    // Deselect current
    trackStates[idx].selected = false;
    document.getElementById(`select-btn-${idx}`).innerText = 'Select Video';
    for (let i = 0; i < TRACK_COUNT; ++i) {
      document.getElementById(`select-btn-${i}`).disabled = false;
    }
    stopVideoStream(idx);
    selectedTrack = null;
  }
}

function stopVideoStream(idx) {
  if (trackStates[idx].stream) {
    trackStates[idx].stream.getTracks().forEach(track => track.stop());
    trackStates[idx].stream = null;
    const videoEl = document.getElementById(`video-track-${idx}`);
    videoEl.srcObject = null;
    videoEl.load();
  }
}

// ==== REC LOGIC ====
recBtn.onclick = async () => {
  if (isRecording || selectedTrack == null || !masterAudioBuffer) return;

  // 3-2-1 countdown
  await showCountdown();

  isRecording = true;
  recBtn.disabled = true;
  let idx = selectedTrack;
  // Show REC flashing indicator
  document.getElementById(`rec-indicator-${idx}`).style.display = 'block';

  // Prepare video recorder
  const videoEl = document.getElementById(`video-track-${idx}`);
  const stream = trackStates[idx].stream;
  const recorder = new MediaRecorder(stream);
  let videoChunks = [];
  recorder.ondataavailable = e => {
    if (e.data.size > 0) videoChunks.push(e.data);
  };
  recorder.onstop = () => {
    let blob = new Blob(videoChunks, { type: 'video/webm' });
    trackStates[idx].videoBlob = blob;
    videoEl.srcObject = null;
    videoEl.src = URL.createObjectURL(blob);
    videoEl.controls = true;
    document.getElementById(`rec-indicator-${idx}`).style.display = 'none';
    isRecording = false;
    recBtn.disabled = false;
  };

  // Sync play all waveforms
  masterWavesurfer.seekTo(0);
  masterWavesurfer.play();
  for (let i = 0; i < TRACK_COUNT; ++i) {
    if (trackWaveSurfers[i]) {
      trackWaveSurfers[i].seekTo(0);
      trackWaveSurfers[i].play();
    }
  }

  // Play output waveform
  setupOutputWaveform();

  // Play master audio in sync with video recording
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const trackSource = audioCtx.createBufferSource();
  trackSource.buffer = masterAudioBuffer;
  trackSource.connect(audioCtx.destination);
  trackSource.start();

  // Start recording video
  recorder.start();
  // Stop after master audio duration
  setTimeout(() => {
    recorder.stop();
    trackSource.stop();
    masterWavesurfer.stop();
    for (let i = 0; i < TRACK_COUNT; ++i) {
      if (trackWaveSurfers[i]) {
        trackWaveSurfers[i].stop();
      }
    }
  }, masterAudioBuffer.duration * 1000);
};

async function showCountdown() {
  countdownEl.style.display = 'block';
  for (let n of [3, 2, 1]) {
    countdownEl.textContent = n;
    await new Promise(res => setTimeout(res, 700));
  }
  countdownEl.textContent = 'GO!';
  await new Promise(res => setTimeout(res, 400));
  countdownEl.style.display = 'none';
}

// ==== INIT: Setup all track waveforms after DOM ====
window.onload = () => {
  for (let i = 0; i < TRACK_COUNT; ++i) {
    setupTrackWaveform(i);
  }
  setupOutputWaveform();
};
