// === GLOBAL STATE ===
let wavesurfer;
let masterAudioBuffer = null;
let bpm = 120; // Default BPM; can be user-set later.
let barsPerChunk = 8;
let chunkStates = []; // { locked: bool }
let chunkStartEnd = []; // [{start: seconds, end: seconds}]
let selectedChunk = 0;

// === INIT ===
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('master-track-upload').addEventListener('change', handleMasterAudioUpload);
  document.getElementById('add-video-track').addEventListener('click', addVideoTrack);
  document.getElementById('dice-edit-all').addEventListener('click', () => alert("Random dice edit for whole video (not yet implemented)"));
  renderVideoTracks();
});

// === AUDIO UPLOAD & WAVESURFER ===
function handleMasterAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  if (wavesurfer) wavesurfer.destroy();

  document.getElementById('waveform-container').style.display = 'block';

  wavesurfer = WaveSurfer.create({
    container: '#waveform',
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
    chunkStates.push({ locked: false });
  }
  selectedChunk = 0;
  renderTimelineChunks();
}

// === TIMELINE CHUNK UI ===
function renderTimelineChunks() {
  const container = document.getElementById('timeline-chunks');
  container.innerHTML = '';
  chunkStartEnd.forEach((chunk, i) => {
    const chunkDiv = document.createElement('div');
    chunkDiv.className = 'timeline-chunk' + (chunkStates[i].locked ? ' locked' : '') + (i === selectedChunk ? ' selected' : '');

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
    playBtn.innerHTML = "&#9654; Play Chunk";
    playBtn.onclick = (e) => {
      e.stopPropagation();
      playChunk(chunk.start, chunk.end);
    };
    chunkDiv.appendChild(playBtn);

    // Dice edit
    const diceBtn = document.createElement('button');
    diceBtn.innerHTML = "🎲 Dice Edit";
    diceBtn.disabled = chunkStates[i].locked;
    diceBtn.onclick = (e) => {
      e.stopPropagation();
      diceEditChunk(i);
    };
    chunkDiv.appendChild(diceBtn);

    // Lock/Unlock
    if (!chunkStates[i].locked) {
      const lockBtn = document.createElement('button');
      lockBtn.innerHTML = "🔒 Lock";
      lockBtn.onclick = (e) => {
        e.stopPropagation();
        chunkStates[i].locked = true;
        renderTimelineChunks();
      };
      chunkDiv.appendChild(lockBtn);
    } else {
      const unlockBtn = document.createElement('button');
      unlockBtn.innerHTML = "🔓 Unlock";
      unlockBtn.onclick = (e) => {
        e.stopPropagation();
        chunkStates[i].locked = false;
        renderTimelineChunks();
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
      renderTimelineChunks();
    };

    container.appendChild(chunkDiv);
  });
}

// === PLAY ONLY THIS CHUNK ===
function playChunk(start, end) {
  if (!wavesurfer) return;
  wavesurfer.play(start, end);
}

// === DICE EDIT LOGIC ===
function diceEditChunk(i) {
  if (chunkStates[i].locked) return;
  // (Pseudo) randomize video edit for this chunk
  alert(`Dice random edit for bars ${chunkStartEnd[i].barStart + 1}-${chunkStartEnd[i].barEnd}`);
}

// === VIDEO TRACKS PLACEHOLDER ===
let videoTracks = [{ id: 1, name: "Track 1", video: null }];

function renderVideoTracks() {
  const container = document.getElementById('video-tracks');
  container.innerHTML = '';
  videoTracks.forEach((track, idx) => {
    const trackDiv = document.createElement('div');
    trackDiv.innerHTML = `<b>${track.name}</b><br>${track.video ? track.video : "No video"}<br>
      <button onclick="removeVideoTrack(${idx})">Remove</button>`;
    container.appendChild(trackDiv);
  });
}

function addVideoTrack() {
  videoTracks.push({ id: Date.now(), name: `Track ${videoTracks.length + 1}`, video: null });
  renderVideoTracks();
}

window.removeVideoTrack = function(idx) {
  videoTracks.splice(idx, 1);
  renderVideoTracks();
};

// === HELPERS ===
function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
