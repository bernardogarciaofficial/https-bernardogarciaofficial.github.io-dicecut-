const NUM_TRACKS = 10;
const videoElements = [];
const videoBlobs = new Array(NUM_TRACKS).fill(null);
const videoStreams = new Array(NUM_TRACKS).fill(null);
let selectedTrack = 0;
let mediaRecorder = null;
let recordedChunks = [];
let recording = false;
let recBlinkElem = null;

const masterTrack = document.getElementById('master-track');
const masterTrackUpload = document.getElementById('master-track-upload');
const recBtn = document.getElementById('rec-btn');
const stopRecBtn = document.getElementById('stop-rec-btn');
const countdownOverlay = document.getElementById('countdown-overlay');
const videoTracksContainer = document.getElementById('video-tracks-container');

// Audio upload
masterTrackUpload.addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    document.getElementById('audio-source').src = objectURL;
    masterTrack.load();
  }
});

// Build video tracks UI
for (let i = 0; i < NUM_TRACKS; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.className = 'video-track';
  if (i === 0) videoTrackDiv.classList.add('selected');
  videoTrackDiv.id = 'video-track-' + (i + 1);

  const filmFrame = document.createElement('div');
  filmFrame.className = 'film-frame';

  const video = document.createElement('video');
  video.setAttribute('autoplay', 'true');
  video.setAttribute('muted', 'true');
  video.setAttribute('playsinline', 'true');
  video.setAttribute('width', '800');
  video.setAttribute('height', '450');
  video.style.background = "#000";
  filmFrame.appendChild(video);
  videoElements[i] = video;

  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'track-controls';

  const selectBtn = document.createElement('button');
  selectBtn.className = 'select-btn';
  selectBtn.textContent = `🎯 Select Track ${i + 1}`;
  selectBtn.onclick = () => selectTrack(i);
  controlsDiv.appendChild(selectBtn);

  videoTrackDiv.appendChild(filmFrame);
  videoTrackDiv.appendChild(controlsDiv);
  videoTracksContainer.appendChild(videoTrackDiv);
}

// Select track
function selectTrack(idx) {
  // Remove selection and blinking rec from all tracks
  document.querySelectorAll('.video-track').forEach(div => {
    div.classList.remove('selected');
    const blink = div.querySelector('.blinking-rec');
    if (blink) blink.remove();
  });
  selectedTrack = idx;
  document.getElementById('video-track-' + (idx + 1)).classList.add('selected');

  // Stop all other camera streams
  videoStreams.forEach((stream, i) => {
    if (stream && i !== idx) {
      stream.getTracks().forEach(track => track.stop());
      videoStreams[i] = null;
      videoElements[i].srcObject = null;
    }
  });

  // Show video or live preview
  if (videoBlobs[idx]) {
    videoElements[idx].srcObject = null;
    videoElements[idx].src = URL.createObjectURL(videoBlobs[idx]);
    videoElements[idx].controls = true;
    videoElements[idx].loop = true;
    videoElements[idx].play();
  } else {
    // Camera preview
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then(stream => {
      videoElements[idx].srcObject = stream;
      videoElements[idx].controls = false;
      videoStreams[idx] = stream;
    }).catch(() => {
      alert("Camera access denied or not available.");
    });
  }
}

// On load, show preview for first track
selectTrack(0);

// Recording logic
recBtn.onclick = async () => {
  if (recording) return;
  if (!masterTrack.src) {
    alert("Upload a master audio track first.");
    return;
  }
  if (!videoStreams[selectedTrack]) {
    // If the stream isn't already open, open it
    try {
      videoStreams[selectedTrack] = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      videoElements[selectedTrack].srcObject = videoStreams[selectedTrack];
    } catch {
      alert("Camera access denied or not available.");
      return;
    }
  }
  await showCountdown();

  // Blinking REC
  const filmFrame = document.getElementById('video-track-' + (selectedTrack + 1)).querySelector('.film-frame');
  recBlinkElem = document.createElement('div');
  recBlinkElem.className = 'blinking-rec';
  recBlinkElem.innerHTML = '<span class="blinking-circle"></span>REC';
  filmFrame.appendChild(recBlinkElem);

  // MediaRecorder
  recBtn.classList.add('hidden');
  stopRecBtn.classList.remove('hidden');
  recordedChunks = [];
  let options = {};
  if (MediaRecorder.isTypeSupported) {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) options = { mimeType: 'video/webm;codecs=vp9' };
    else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) options = { mimeType: 'video/webm;codecs=vp8' };
    else if (MediaRecorder.isTypeSupported('video/webm')) options = { mimeType: 'video/webm' };
  }
  try {
    mediaRecorder = new MediaRecorder(videoStreams[selectedTrack], options);
  } catch {
    mediaRecorder = new MediaRecorder(videoStreams[selectedTrack]);
  }
  mediaRecorder.ondataavailable = e => { if (e.data.size) recordedChunks.push(e.data); };
  mediaRecorder.onstop = () => {
    if (recBlinkElem) recBlinkElem.remove();
    recBtn.classList.remove('hidden');
    stopRecBtn.classList.add('hidden');
    recording = false;
    if (!recordedChunks.length) return;
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    videoBlobs[selectedTrack] = blob;
    videoElements[selectedTrack].srcObject = null;
    videoElements[selectedTrack].src = URL.createObjectURL(blob);
    videoElements[selectedTrack].controls = true;
    videoElements[selectedTrack].loop = true;
    videoElements[selectedTrack].play();
    recordedChunks = [];
  };
  mediaRecorder.start();
  recording = true;
  masterTrack.currentTime = 0;
  masterTrack.play();

  masterTrack.onended = () => { if (recording) stopRecording(); };
};

stopRecBtn.onclick = () => { if (recording) stopRecording(); };

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
  if (masterTrack && !masterTrack.paused) {
    masterTrack.pause();
    masterTrack.currentTime = 0;
  }
  document.querySelectorAll('.blinking-rec').forEach(rec => rec.remove());
  recBtn.classList.remove('hidden');
  stopRecBtn.classList.add('hidden');
  recording = false;
}

function showCountdown() {
  return new Promise(resolve => {
    countdownOverlay.classList.remove('hidden');
    let count = 3;
    countdownOverlay.textContent = count;
    const interval = setInterval(() => {
      count--;
      if (count === 0) countdownOverlay.textContent = "🎬";
      else if (count < 0) {
        countdownOverlay.classList.add('hidden');
        clearInterval(interval);
        resolve();
      } else {
        countdownOverlay.textContent = count;
      }
    }, 900);
  });
}
