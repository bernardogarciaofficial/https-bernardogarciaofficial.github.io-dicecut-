// === GLOBAL STATE ===
let wavesurfer;
let masterAudioBuffer = null;
let bpm = 120; // Default BPM; could be user-settable
let barsPerChunk = 8;
let chunkStates = []; // { locked: bool }
let selectedChunk = 0;
let chunkStartEnd = []; // [{start: seconds, end: seconds}]
let videoTracks = [];
let diceEdits = {}; // { chunkIndex: { ...edit info per track } }

// Hide timeline and waveform until audio is uploaded
document.getElementById('waveform-container').style.display = 'none';
document.getElementById('timeline-chunks').style.display = 'none';

// === MASTER AUDIO UPLOAD & WAVEFORM ===
document.getElementById('master-track-upload').addEventListener('change', async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const audio = document.getElementById('master-track');
  audio.src = URL.createObjectURL(file);

  if (wavesurfer) {
    wavesurfer.destroy();
  }
  wavesurfer = WaveSurfer.create({
    container: '#waveform-container',
    waveColor: '#2974fa',
    progressColor: '#bada55',
    height: 80,
    barWidth: 2,
    responsive: true,
    hideScrollbar: true
  });
  wavesurfer.load(audio.src);

  // decode AudioBuffer for bar calculations
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  wavesurfer.on('ready', () => {
    // Show timeline and waveform
    document.getElementById('waveform-container').style.display = '';
    document.getElementById('timeline-chunks').style.display = '';
    setupTimelineChunks();
  });
});

// === TIMELINE CHUNKS LOGIC ===
function setupTimelineChunks() {
  // Calculate number of bars
  const secondsPerBeat = 60 / bpm;
  const beatsPerBar = 4; // assuming 4/4
  const barLength = secondsPerBeat * beatsPerBar;
  const totalBars = Math.ceil(masterAudioBuffer.duration / barLength);
  const chunkCount = Math.ceil(totalBars / barsPerChunk);

  chunkStates = [];
  chunkStartEnd = [];
  for (let i = 0; i < chunkCount; i++) {
    const startBar = i * barsPerChunk;
    const endBar = Math.min((i + 1) * barsPerChunk, totalBars);
    const startSec = startBar * barLength;
    const endSec = Math.min(endBar * barLength, masterAudioBuffer.duration);
    chunkStates.push({ locked: false });
    chunkStartEnd.push({ start: startSec, end: endSec });
  }
  selectedChunk = 0;

  renderTimelineChunks();
}

function renderTimelineChunks() {
  const container = document.getElementById('timeline-chunks');
  container.innerHTML = '';
  chunkStartEnd.forEach((chunk, i) => {
    const chunkDiv = document.createElement('div');
    chunkDiv.className = 'timeline-chunk' + (chunkStates[i].locked ? ' locked' : '') + (i === selectedChunk ? ' selected' : '');
    chunkDiv.title = chunkStates[i].locked ? 'Locked (click unlock to edit)' : 'Click to select chunk';
    chunkDiv.innerHTML = `
      <div>
        <strong>${i * barsPerChunk + 1}-${Math.round(chunk.end / ((60 / bpm) * 4))}</strong>
        <br>(${formatTime(chunk.start)}-${formatTime(chunk.end)})
      </div>
      <div class="chunk-controls"></div>
    `;

    // Show lock or unlock icon depending on state
    const iconSpan = document.createElement('span');
    if (chunkStates[i].locked) {
      iconSpan.className = 'lock-icon';
      iconSpan.innerHTML = '🔒';
    } else {
      iconSpan.className = 'unlock-icon';
      iconSpan.innerHTML = '🔓';
    }
    chunkDiv.appendChild(iconSpan);

    // Controls: play, dice, lock/unlock
    const controls = chunkDiv.querySelector('.chunk-controls');
    controls.innerHTML = '';

    // Play chunk
    const playBtn = document.createElement('button');
    playBtn.innerText = '▶ Play Chunk';
    playBtn.onclick = (e) => {
      e.stopPropagation();
      playChunk(i);
    };
    controls.appendChild(playBtn);

    // Dice edit
    const diceBtn = document.createElement('button');
    diceBtn.innerText = '🎲 Dice Edit';
    diceBtn.disabled = chunkStates[i].locked;
    diceBtn.onclick = (e) => {
      e.stopPropagation();
      diceEditChunk(i);
    };
    controls.appendChild(diceBtn);

    // Only show lock OR unlock button
    if (chunkStates[i].locked) {
      const unlockBtn = document.createElement('button');
      unlockBtn.innerText = '🔓 Unlock';
      unlockBtn.onclick = (e) => {
        e.stopPropagation();
        unlockChunk(i);
      };
      controls.appendChild(unlockBtn);
    } else {
      const lockBtn = document.createElement('button');
      lockBtn.innerText = '🔒 Lock';
      lockBtn.onclick = (e) => {
        e.stopPropagation();
        lockChunk(i);
      };
      controls.appendChild(lockBtn);
    }

    chunkDiv.onclick = () => {
      if (!chunkStates[i].locked) {
        selectedChunk = i;
        renderTimelineChunks();
      }
    };

    container.appendChild(chunkDiv);
  });
}

// === FORMAT TIME ===
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// === LOCK/UNLOCK ===
function lockChunk(idx) {
  chunkStates[idx].locked = true;
  renderTimelineChunks();
}
function unlockChunk(idx) {
  chunkStates[idx].locked = false;
  renderTimelineChunks();
}

// === DICE EDIT ===
function diceEditChunk(idx) {
  if (chunkStates[idx].locked) return;
  // Example: for each video track, pick a random segment for this chunk
  diceEdits[idx] = {};
  videoTracks.forEach((track, tIdx) => {
    diceEdits[idx][tIdx] = {
      randomSeed: Math.random()
      // Real logic: select a random set of video segments for this chunk
    };
  });
  alert(`Chunk ${idx + 1} has been dice-random-edited!`);
  lockChunk(idx);
}

// === PLAY CHUNK ===
function playChunk(idx) {
  const audio = document.getElementById('master-track');
  const { start, end } = chunkStartEnd[idx];
  audio.currentTime = start;
  audio.play();
  // Pause at end of chunk
  const stopHandler = () => {
    if (audio.currentTime >= end) {
      audio.pause();
      audio.removeEventListener('timeupdate', stopHandler);
    }
  };
  audio.addEventListener('timeupdate', stopHandler);
  // TODO: Video preview to sync with this chunk if needed
}

// === DICE ENTIRE VIDEO ===
document.getElementById('dice-entire-btn').onclick = () => {
  if (!masterAudioBuffer) {
    alert('Please upload a master audio track first!');
    return;
  }
  for (let i = 0; i < chunkStates.length; i++) {
    if (!chunkStates[i].locked) {
      diceEditChunk(i);
    }
  }
  alert('Whole video has been dice-edited (unlocked chunks only)!');
};

// === VIDEO TRACKS LOGIC ===
const videoTracksDiv = document.getElementById('video-tracks');
document.getElementById('add-track-btn').onclick = () => {
  const idx = videoTracks.length + 1;
  videoTracks.push({
    name: `Track ${idx}`,
    videos: []
  });
  renderVideoTracks();
};
function renderVideoTracks() {
  videoTracksDiv.innerHTML = '';
  videoTracks.forEach((track, tIdx) => {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'video-track';
    trackDiv.innerHTML = `
      <h3>${track.name}</h3>
      <div class="video-preview" id="video-preview-${tIdx}">
        <span style="color:#aaa;font-size:1.2em;">No video</span>
      </div>
      <input type="file" accept="video/*" data-track="${tIdx}">
      <div class="video-track-controls">
        <button onclick="removeTrack(${tIdx})">Remove</button>
      </div>
    `;
    // File input
    const fileInput = trackDiv.querySelector('input[type="file"]');
    fileInput.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      videoTracks[tIdx].videos.push(url);
      const preview = trackDiv.querySelector('.video-preview');
      preview.innerHTML = `<video src="${url}" controls></video>`;
    });
    videoTracksDiv.appendChild(trackDiv);
  });
}
window.removeTrack = function(idx) {
  videoTracks.splice(idx, 1);
  renderVideoTracks();
};

// === INITIAL RENDER ===
renderVideoTracks();
