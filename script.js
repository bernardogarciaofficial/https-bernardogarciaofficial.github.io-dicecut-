// === GLOBAL STATE ===
let wavesurfer;
let masterAudioBuffer = null;
let bpm = 120; // Default BPM; can be user-set later.
let barsPerChunk = 8;
let chunkStates = []; // { locked: bool, rec: bool }
let chunkStartEnd = []; // [{start: seconds, end: seconds, barStart, barEnd}]
let selectedChunk = 0;

// Video tracks: always 10, for now
let videoTracks = [];
const NUM_TRACKS = 10;

// === INIT ===
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('master-track-upload').addEventListener('change', handleMasterAudioUpload);
  document.getElementById('dice-edit-all').addEventListener('click', () => alert("Random dice edit for whole video (not yet implemented)"));
  // Initialize 10 tracks
  for (let i = 0; i < NUM_TRACKS; i++) {
    videoTracks.push({ id: i + 1, name: `Track ${i + 1}`, video: null });
  }
  renderVideoTracks();
});

// === AUDIO UPLOAD & WAVESURFER ===
function handleMasterAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);

  // Main waveform (just for visual reference, not per video track)
  if (wavesurfer) wavesurfer.destroy();
  document.getElementById('main-waveform-container').style.display = 'block';

  wavesurfer = WaveSurfer.create({
    container: '#main-waveform',
    waveColor: '#b5c9e7',
    progressColor: '#4a90e2',
    cursorColor: '#f39c12',
    barWidth: 2,
    height: 80,
    responsive: true
  });
  wavesurfer.load(url);

  // Get decoded audio buffer for chunk timing
  const reader = new FileReader();
  reader.onload = async (ev) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = ev.target.result;
    masterAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    setupTimelineChunks();
    renderVideoTracks(); // re-render tracks to show chunk controls
  };
  reader.readAsArrayBuffer(file);
}

function setupTimelineChunks() {
  if (!masterAudioBuffer) return;
  const duration = masterAudioBuffer.duration;
  const secondsPerBar = 60 / bpm * 4; // assuming 4/4 time, 4 beats per bar
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
  selectedChunk = 0;
}

// === TIMELINE CHUNK UI (shared state, used above each video track) ===
function renderTimelineChunks(currentTrackIdx) {
  // currentTrackIdx: for possible future per-track highlighting (not used now)
  const container = document.createElement('div');
  container.className = 'timeline-chunks';

  chunkStartEnd.forEach((chunk, i) => {
    const chunkDiv = document.createElement('div');
    chunkDiv.className = 'timeline-chunk' +
      (chunkStates[i].locked ? ' locked' : '') +
      (i === selectedChunk ? ' selected' : '');

    // Label: bars and time
    const barsLabel = document.createElement('div');
    barsLabel.className = 'chunk-label';
    barsLabel.textContent = `${chunk.barStart + 1}-${chunk.barEnd}`;
    chunkDiv.appendChild(barsLabel);

    const timeLabel = document.createElement('div');
    timeLabel.className = 'chunk-time';
    timeLabel.textContent = `(${formatTime(chunk.start)}-${formatTime(chunk.end)})`;
    chunkDiv.appendChild(timeLabel);

    // Play only this chunk
    const playBtn = document.createElement('button');
    playBtn.innerHTML = "&#9654; Play";
    playBtn.onclick = (e) => {
      e.stopPropagation();
      playChunk(chunk.start, chunk.end);
    };
    chunkDiv.appendChild(playBtn);

    // Dice edit
    const diceBtn = document.createElement('button');
    diceBtn.innerHTML = "🎲 Dice";
    diceBtn.disabled = chunkStates[i].locked;
    diceBtn.onclick = (e) => {
      e.stopPropagation();
      diceEditChunk(i, currentTrackIdx);
    };
    chunkDiv.appendChild(diceBtn);

    // REC button
    const recBtn = document.createElement('button');
    recBtn.innerHTML = chunkStates[i].rec ? "⏺ Recording..." : "⏺ REC";
    recBtn.style.background = chunkStates[i].rec ? '#ff5151' : '#ececec';
    recBtn.style.color = chunkStates[i].rec ? 'white' : '#222';
    recBtn.disabled = chunkStates[i].locked || chunkStates[i].rec;
    recBtn.onclick = (e) => {
      e.stopPropagation();
      startRecordingChunk(i);
    };
    chunkDiv.appendChild(recBtn);

    // Stop button
    const stopBtn = document.createElement('button');
    stopBtn.innerHTML = "■ Stop";
    stopBtn.disabled = !chunkStates[i].rec;
    stopBtn.onclick = (e) => {
      e.stopPropagation();
      stopRecordingChunk(i);
    };
    chunkDiv.appendChild(stopBtn);

    // Lock/Unlock
    if (!chunkStates[i].locked) {
      const lockBtn = document.createElement('button');
      lockBtn.innerHTML = "🔒 Lock";
      lockBtn.onclick = (e) => {
        e.stopPropagation();
        chunkStates[i].locked = true;
        rerenderAllChunkTimelines();
      };
      chunkDiv.appendChild(lockBtn);
    } else {
      const unlockBtn = document.createElement('button');
      unlockBtn.innerHTML = "🔓 Unlock";
      unlockBtn.onclick = (e) => {
        e.stopPropagation();
        chunkStates[i].locked = false;
        rerenderAllChunkTimelines();
      };
      chunkDiv.appendChild(unlockBtn);
    }

    // Lock/Unlock Icon
    if (chunkStates[i].locked) {
      const lockIcon = document.createElement('span');
      lockIcon.className = 'lock-icon';
      lockIcon.textContent = '🔒';
      chunkDiv.appendChild(lockIcon);
    } else {
      const unlockIcon = document.createElement('span');
      unlockIcon.className = 'unlock-icon';
      unlockIcon.textContent = '🔓';
      chunkDiv.appendChild(unlockIcon);
    }

    // Select chunk on click
    chunkDiv.onclick = () => {
      selectedChunk = i;
      rerenderAllChunkTimelines();
    };

    container.appendChild(chunkDiv);
  });

  return container;
}

function rerenderAllChunkTimelines() {
  renderVideoTracks();
}

// === RECORDING LOGIC ===
function startRecordingChunk(i) {
  // Only one chunk can be "recording" at a time
  chunkStates.forEach((ch, idx) => {
    if (idx === i) ch.rec = true;
    else ch.rec = false;
  });
  rerenderAllChunkTimelines();
  // Future: Start recording logic for selected video track/chunk here!
  // For now: simulate start.
  alert(`Started recording chunk ${chunkStartEnd[i].barStart + 1}-${chunkStartEnd[i].barEnd}\n(This is a placeholder for actual video recording logic.)`);
}

function stopRecordingChunk(i) {
  chunkStates[i].rec = false;
  rerenderAllChunkTimelines();
  // Future: Stop recording logic here.
  alert(`Stopped recording chunk ${chunkStartEnd[i].barStart + 1}-${chunkStartEnd[i].barEnd}\n(This is a placeholder for actual stop logic.)`);
}

// === PLAY ONLY THIS CHUNK ===
function playChunk(start, end) {
  if (!wavesurfer) return;
  wavesurfer.play(start, end);
}

// === DICE EDIT LOGIC ===
function diceEditChunk(i, trackIdx) {
  if (chunkStates[i].locked) return;
  // (Pseudo) randomize video edit for this chunk for the selected video track
  const trackName = videoTracks[trackIdx] ? videoTracks[trackIdx].name : "Unknown Track";
  alert(`Dice random edit for bars ${chunkStartEnd[i].barStart + 1}-${chunkStartEnd[i].barEnd} on ${trackName}`);
}

// === VIDEO TRACKS ===
function renderVideoTracks() {
  const container = document.getElementById('video-tracks');
  container.innerHTML = '';
  videoTracks.forEach((track, idx) => {
    const trackDiv = document.createElement('div');
    trackDiv.className = "video-track-container";

    // Timeline per track
    const tlContainer = document.createElement('div');
    tlContainer.className = "tl-chunks-container";
    if (masterAudioBuffer) {
      tlContainer.appendChild(renderTimelineChunks(idx));
    }
    trackDiv.appendChild(tlContainer);

    // YouTube-size video screen
    const vScreen = document.createElement('div');
    vScreen.className = "video-screen";
    vScreen.innerHTML = track.video ? track.video : `Video Screen ${track.id}<br><span style="font-size:0.9em;">(16:9, YouTube size)</span>`;
    trackDiv.appendChild(vScreen);

    // Track label & controls
    const title = document.createElement('div');
    title.textContent = track.name;
    title.className = "video-track-title";
    trackDiv.appendChild(title);

    const controls = document.createElement('div');
    controls.className = "video-track-controls";
    controls.innerHTML = `${track.video ? track.video : "No video"}<br>`;
    trackDiv.appendChild(controls);

    container.appendChild(trackDiv);
  });
}

// === HELPERS ===
function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
