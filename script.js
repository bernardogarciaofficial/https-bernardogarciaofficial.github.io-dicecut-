// === GLOBAL STATE ===
const TRACK_COUNT = 10;
let masterWavesurfer;
let masterAudioBuffer = null;
let barsPerChunk = 8;
let chunkStates = [];
let chunkStartEnd = [];
let trackWaveSurfers = [];
let trackStates = Array.from({ length: TRACK_COUNT }, () => ({
  selected: false,
  wavesurfer: null,
  stream: null,
  recorder: null,
  videoBlob: null,
}));
let selectedTrack = null;
let isRecording = false;
let memberCount = 0;

// ==== DOM ELEMENTS ====
const recBtn = document.getElementById('recBtn');
const countdownEl = document.getElementById('countdown');
const memberCountEl = document.getElementById('member-count');
const masterAudioInput = document.getElementById('masterAudioInput');
const masterWaveformEl = document.getElementById('masterWaveform');
const outputWaveformEl = document.getElementById('outputWaveform');
const videoTracksContainer = document.getElementById('video-tracks');
const chunkTimelineEl = document.getElementById('master-timeline-chunks');

// ==== MEMBER COUNTER SIMULATION ====
function updateMemberCounter() {
  memberCount = Math.floor(Math.random() * 120) + 2;
  memberCountEl.textContent = memberCount;
}
setInterval(updateMemberCounter, 4000);
updateMemberCounter();

// ==== AUDIO UPLOAD & WAVEFORM ====
masterAudioInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
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
  setupTimelineChunks();
  renderChunkTimeline();
});

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

// ==== TIMELINE CHUNKS ====
function setupTimelineChunks() {
  if (!masterAudioBuffer) return;
  const duration = masterAudioBuffer.duration;
  const bpm = 120;
  const secondsPerBar = 60 / bpm * 4;
  const totalBars = Math.ceil(duration / secondsPerBar);
  const numChunks = Math.ceil(totalBars / barsPerChunk);

  chunkStartEnd = [];
  chunkStates = [];
  for (let i = 0; i < numChunks; ++i) {
    const barStart = i * barsPerChunk;
    const barEnd = Math.min((i + 1) * barsPerChunk, totalBars);
    const startSec = barStart * secondsPerBar;
    const endSec = Math.min(barEnd * secondsPerBar, duration);
    chunkStartEnd.push({ start: startSec, end: endSec, barStart, barEnd });
    chunkStates.push({ locked: false, rec: false });
  }
}

function renderChunkTimeline() {
  chunkTimelineEl.innerHTML = '';
  chunkStartEnd.forEach((chunk, i) => {
    const chunkDiv = document.createElement('div');
    chunkDiv.className = 'timeline-chunk';
    const barsLabel = document.createElement('div');
    barsLabel.className = 'chunk-label';
    barsLabel.textContent = `Bars ${chunk.barStart + 1}-${chunk.barEnd}`;
    chunkDiv.appendChild(barsLabel);

    const timeLabel = document.createElement('div');
    timeLabel.className = 'chunk-time';
    timeLabel.textContent = `(${formatTime(chunk.start)} - ${formatTime(chunk.end)})`;
    chunkDiv.appendChild(timeLabel);

    chunkTimelineEl.appendChild(chunkDiv);
  });
}

// ==== TRACKS UI ====
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
  buildTracksUI();
  setupOutputWaveform();
};

// ==== HELPERS ====
function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
