// === GLOBAL STATE ===
let masterWavesurfer;
let masterAudioBuffer = null;
let bpm = 120; // Default BPM; can be user-set later.
let barsPerChunk = 8;
let chunkStates = []; // { locked: bool, rec: bool }
let chunkStartEnd = []; // [{start: seconds, end: seconds, barStart, barEnd}]
let selectedChunk = 0;
let recActiveChunk = null; // Index of currently recording chunk, null if none
let recActiveFinal = false; // Is the OUT screen recording?
let countdownTimeout = null;

// Video tracks: always 10, for now
let videoTracks = [];
const NUM_TRACKS = 10;
let mediaStreams = {}; // { trackIdx: stream }

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('master-track-upload').addEventListener('change', handleMasterAudioUpload);
  document.getElementById('dice-edit-all').addEventListener('click', () => alert("Random dice edit for whole video (not yet implemented)"));
  document.getElementById('dice-edit-chunks').addEventListener('click', () => alert("Random dice edit 8 bars at a time (not yet implemented)"));
  // Initialize 10 tracks
  for (let i = 0; i < NUM_TRACKS; i++) {
    videoTracks.push({ id: i + 1, name: `Track ${i + 1}`, video: null });
  }
  renderVideoTracks();
  simulateMemberCounter();
});

function simulateMemberCounter() {
  // Simulate member counter (placeholder for real backend connection)
  function updateCounter() {
    // In production, replace this with real-time backend logic!
    const n = Math.floor(Math.random() * 7) + 4; // between 4 and 10 for demo
    document.getElementById("member-count").textContent = n;
  }
  updateCounter();
  setInterval(updateCounter, 5000);
}

// === AUDIO UPLOAD & WAVESURFER ===
function handleMasterAudioUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);

  // Main waveform (at the bottom, with final OUT)
  if (masterWavesurfer) masterWavesurfer.destroy();
  document.getElementById('master-waveform-container').style.display = 'flex';

  masterWavesurfer = WaveSurfer.create({
    container: '#master-waveform',
    waveColor: '#b5c9e7',
    progressColor: '#4a90e2',
    cursorColor: '#f39c12',
    barWidth: 2,
    height: 80,
    responsive: true
  });
  masterWavesurfer.load(url);

  // Get decoded audio buffer for chunk timing
  const reader = new FileReader();
  reader.onload = async (ev) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = ev.target.result;
      masterAudioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setupTimelineChunks();
      renderMasterTimelineChunks();
      renderVideoTracks(); // re-render tracks to show waveform and timeline chunks
    } catch (err) {
      alert("Could not load or decode audio file. Please use a standard .mp3 or .wav file.");
    }
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

// === TIMELINE CHUNK UI (MASTER OUTPUT) ===
function renderMasterTimelineChunks() {
  const container = document.getElementById('master-timeline-chunks');
  container.innerHTML = '';
  if (!masterAudioBuffer) return;
  container.appendChild(renderTimelineChunks({ showDice: true, isFinal: true }));
}

function renderTimelineChunks({ showDice = false, isFinal = false } = {}) {
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

    // STOP button
    const stopBtn = document.createElement('button');
    stopBtn.innerHTML = "■ Stop";
    stopBtn.onclick = (e) => {
      e.stopPropagation();
      stopPlayback();
    };
    chunkDiv.appendChild(stopBtn);

    // Dice edit button (only on master/final output)
    if (showDice) {
      const diceBtn = document.createElement('button');
      diceBtn.innerHTML = "🎲 Dice";
      diceBtn.onclick = (e) => {
        e.stopPropagation();
        alert(`Dice random edit for bars ${chunk.barStart + 1}-${chunk.barEnd} (not yet implemented)`);
      };
      chunkDiv.appendChild(diceBtn);
    }

    // REC button
    const recBtn = document.createElement('button');
    recBtn.innerHTML = chunkStates[i].rec ? "⏺ Recording..." : "⏺ REC";
    recBtn.style.background = chunkStates[i].rec ? '#ff5151' : '#ececec';
    recBtn.style.color = chunkStates[i].rec ? 'white' : '#222';
    recBtn.disabled = chunkStates[i].locked || chunkStates[i].rec;
    recBtn.onclick = (e) => {
      e.stopPropagation();
      triggerCountdown(isFinal ? "final" : selectedChunk, i);
    };
    chunkDiv.appendChild(recBtn);

    // Lock/Unlock
    if (!chunkStates[i].locked) {
      const lockBtn = document.createElement('button');
      lockBtn.innerHTML = "🔒 Lock";
      lockBtn.onclick = (e) => {
        e.stopPropagation();
        chunkStates[i].locked = true;
        rerenderAllTimelines();
      };
      chunkDiv.appendChild(lockBtn);
    } else {
      const unlockBtn = document.createElement('button');
      unlockBtn.innerHTML = "🔓 Unlock";
      unlockBtn.onclick = (e) => {
        e.stopPropagation();
        chunkStates[i].locked = false;
        rerenderAllTimelines();
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
      rerenderAllTimelines();
    };

    container.appendChild(chunkDiv);
  });

  return container;
}

function rerenderAllTimelines() {
  renderMasterTimelineChunks();
  renderVideoTracks();
}

// === COUNTDOWN AND REC INDICATOR ===
function triggerCountdown(target, chunkIdx) {
  // target: "final" for OUT, or index of video track
  let overlay, screen, recId;
  if (target === "final") {
    overlay = document.getElementById('final-countdown');
    screen = document.getElementById('final-video-screen');
    recId = 'final-rec-indicator';
  } else {
    overlay = document.getElementById(`countdown-${target}`);
    screen = document.getElementById(`video-screen-${target}`);
    recId = `rec-indicator-${target}`;
  }
  if (!overlay || !screen) return;

  let count = 3;
  overlay.innerText = count;
  overlay.classList.add("show");

  function nextCount() {
    count--;
    if (count > 0) {
      overlay.innerText = count;
      countdownTimeout = setTimeout(nextCount, 800);
    } else {
      overlay.innerText = "GO!";
      countdownTimeout = setTimeout(() => {
        overlay.classList.remove("show");
        overlay.innerText = "";
        startRecordingChunk(chunkIdx, target === "final", target === "final" ? null : target);
        showRecIndicator(recId, true);
      }, 800);
    }
  }
  countdownTimeout = setTimeout(nextCount, 800);
}

function showRecIndicator(recId, show) {
  const el = document.getElementById(recId);
  if (el) el.style.display = show ? "block" : "none";
}

// === RECORDING LOGIC ===
function startRecordingChunk(i, isFinal = false, videoTrackIdx = null) {
  // Only one chunk can be "recording" at a time
  chunkStates.forEach((ch, idx) => {
    if (idx === i) ch.rec = true;
    else ch.rec = false;
  });
  recActiveChunk = i;
  recActiveFinal = isFinal;
  rerenderAllTimelines();

  if (isFinal) showRecIndicator('final-rec-indicator', true);
  else showRecIndicator(`rec-indicator-${videoTrackIdx}`, true);

  // Simulate end of recording after 5 seconds for demo
  setTimeout(() => {
    chunkStates[i].rec = false;
    if (isFinal) showRecIndicator('final-rec-indicator', false);
    else showRecIndicator(`rec-indicator-${videoTrackIdx}`, false);
    recActiveChunk = null;
    rerenderAllTimelines();
  }, 5000);

  // Future: Start recording logic for selected video track/chunk here!
}

// === STOP PLAYBACK ===
function stopPlayback() {
  if (masterWavesurfer) {
    masterWavesurfer.stop();
  }
}

// === VIDEO TRACKS ===
function renderVideoTracks() {
  const container = document.getElementById('video-tracks');
  container.innerHTML = '';
  videoTracks.forEach((track, idx) => {
    const trackDiv = document.createElement('div');
    trackDiv.className = "video-track-container";

    // Large waveform above each video screen track
    const waveformDiv = document.createElement('div');
    waveformDiv.className = 'waveform-track-container';
    if (masterAudioBuffer) {
      const wf = document.createElement('div');
      wf.className = 'waveform-track';
      wf.innerHTML = '<!-- (Waveform rendering placeholder for per-track; can be implemented with a separate wavesurfer instance or image) -->';
      waveformDiv.appendChild(wf);
      trackDiv.appendChild(waveformDiv);
    }

    // Timeline per track (no Dice button)
    const tlContainer = document.createElement('div');
    tlContainer.className = "tl-chunks-container";
    if (masterAudioBuffer) {
      tlContainer.appendChild(renderTimelineChunks({ showDice: false }));
    }
    trackDiv.appendChild(tlContainer);

    // Larger YouTube-size video screen
    const vScreen = document.createElement('div');
    vScreen.className = "video-screen";
    vScreen.id = `video-screen-${idx}`;
    vScreen.innerHTML =
      (track.video
        ? `<video class="video-element" id="video-element-${idx}" autoplay muted playsinline></video>`
        : `Video Screen ${track.id}<br><span class="video-desc">(16:9, YouTube size)</span>`)
      + `<div class="rec-indicator" id="rec-indicator-${idx}" style="display:none">● REC</div>`
      + `<div class="countdown-overlay" id="countdown-${idx}"></div>`;
    trackDiv.appendChild(vScreen);

    // Track label & controls
    const title = document.createElement('div');
    title.textContent = track.name;
    title.className = "video-track-title";
    trackDiv.appendChild(title);

    const controls = document.createElement('div');
    controls.className = "video-track-controls";
    controls.innerHTML = `${track.video ? track.video : "No video"}<br>`;

    // Select Video Button (no button on final/out)
    const selectBtn = document.createElement('button');
    selectBtn.className = "select-video-btn";
    selectBtn.textContent = "Select Video";
    selectBtn.onclick = () => selectVideoSource(idx);
    controls.appendChild(selectBtn);

    trackDiv.appendChild(controls);

    container.appendChild(trackDiv);

    // If a stream is active, display it in the video element
    if (mediaStreams[idx] && track.video) {
      const videoEl = document.getElementById(`video-element-${idx}`);
      if (videoEl && videoEl.srcObject !== mediaStreams[idx]) {
        videoEl.srcObject = mediaStreams[idx];
      }
    }
  });
}

// === CAMERA PERMISSION & VIDEO DISPLAY ===
async function selectVideoSource(idx) {
  try {
    if (mediaStreams[idx]) {
      // Already streaming, just show it
      videoTracks[idx].video = true;
      renderVideoTracks();
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false });
    mediaStreams[idx] = stream;
    videoTracks[idx].video = true;
    renderVideoTracks();
  } catch (err) {
    alert('Could not access camera. Please allow camera permissions for video recording.');
  }
}

// === PLAY ONLY THIS CHUNK ===
function playChunk(start, end) {
  if (!masterWavesurfer) return;
  masterWavesurfer.play(start, end);
}

// === HELPERS ===
function formatTime(seconds) {
  if (!isFinite(seconds)) return "0:00";
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}
