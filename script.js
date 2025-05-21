// === GLOBAL STATE ===
const TRACK_COUNT = 10;
let masterWavesurfer;
let masterAudioBuffer = null;
let bpm = 120;
let barsPerChunk = 8;
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

// ==== DOM ELEMENTS ====
const tracksSection = document.querySelector('.tracks-section');
const recBtn = document.getElementById('recBtn');
const countdownEl = document.getElementById('countdown');
const memberCountEl = document.getElementById('memberCount');
const masterAudioInput = document.getElementById('masterAudioInput');
const loadAudioBtn = document.getElementById('loadAudioBtn');
const mainMasterWaveformEl = document.getElementById('mainMasterWaveform');
const outputWaveformEl = document.getElementById('outputWaveform');

// ==== MEMBER COUNTER SIMULATION ====
function updateMemberCounter() {
  memberCount = Math.floor(Math.random() * 120) + 2;
  memberCountEl.textContent = memberCount;
}
setInterval(updateMemberCounter, 4000);
updateMemberCounter();

// ==== BUILD UI ====
function buildTracksUI() {
  tracksSection.innerHTML = '';
  for (let i = 0; i < TRACK_COUNT; ++i) {
    const track = document.createElement('div');
    track.className = 'video-track';
    track.dataset.index = i;

    // Audio waveform above video
    const waveformDiv = document.createElement('div');
    waveformDiv.className = 'waveform-container';
    const wsDiv = document.createElement('div');
    wsDiv.className = 'waveform';
    wsDiv.id = `waveform-track-${i}`;
    waveformDiv.appendChild(wsDiv);
    track.appendChild(waveformDiv);

    // Video element
    const video = document.createElement('video');
    video.width = 280;
    video.height = 170;
    video.autoplay = false;
    video.controls = false;
    video.muted = true;
    video.id = `video-track-${i}`;
    track.appendChild(video);

    // REC indicator (hidden by default)
    const recIndicator = document.createElement('div');
    recIndicator.className = 'rec-indicator';
    recIndicator.innerText = '● REC';
    recIndicator.style.display = 'none';
    recIndicator.id = `rec-indicator-${i}`;
    track.appendChild(recIndicator);

    // Select/Deselect Video button
    const selectBtn = document.createElement('button');
    selectBtn.className = 'select-btn';
    selectBtn.innerText = 'Select Video';
    selectBtn.id = `select-btn-${i}`;
    selectBtn.onclick = () => handleSelectVideo(i);
    track.appendChild(selectBtn);

    tracksSection.appendChild(track);
  }
}
buildTracksUI();

// ==== WAVEFORM SETUP ====
let mainMasterWS = null;
function setupMainMasterWaveform(audioUrlOrBuffer) {
  if (mainMasterWS) {
    mainMasterWS.destroy();
  }
  mainMasterWS = WaveSurfer.create({
    container: mainMasterWaveformEl,
    waveColor: '#1976d2',
    progressColor: '#c62828',
    height: 54,
  });

  if (typeof audioUrlOrBuffer === 'string') {
    mainMasterWS.load(audioUrlOrBuffer);
  } else if (audioUrlOrBuffer instanceof AudioBuffer) {
    mainMasterWS.loadDecodedBuffer(audioUrlOrBuffer);
  }
}

function setupTrackWaveform(idx) {
  const wsDiv = document.getElementById(`waveform-track-${idx}`);
  if (trackStates[idx].wavesurfer) {
    trackStates[idx].wavesurfer.destroy();
  }
  trackStates[idx].wavesurfer = WaveSurfer.create({
    container: wsDiv,
    waveColor: '#1976d2',
    progressColor: '#c62828',
    height: 44,
    interact: false,
  });
  if (masterAudioBuffer) {
    trackStates[idx].wavesurfer.loadDecodedBuffer(masterAudioBuffer);
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
    height: 44,
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
  setupMainMasterWaveform(url);
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
  if (mainMasterWS) {
    mainMasterWS.seekTo(0);
    mainMasterWS.play();
  }
  for (let i = 0; i < TRACK_COUNT; ++i) {
    if (trackStates[i].wavesurfer) {
      trackStates[i].wavesurfer.seekTo(0);
      trackStates[i].wavesurfer.play();
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
    if (mainMasterWS) mainMasterWS.stop();
    for (let i = 0; i < TRACK_COUNT; ++i) {
      if (trackStates[i].wavesurfer) {
        trackStates[i].wavesurfer.stop();
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
