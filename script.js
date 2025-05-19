// ======= Audio upload =======
document.getElementById('master-track-upload').addEventListener('change', function(event) {
  const audioPlayer = document.getElementById('master-track');
  const audioSource = document.getElementById('audio-source');
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    audioSource.src = objectURL;
    audioPlayer.load();
  }
});

// ======= Setup video tracks =======
const videoTracksContainer = document.getElementById('video-tracks-container');
const NUM_TRACKS = 10;
let selectedTrackIndex = null;
const videoStreams = new Array(NUM_TRACKS).fill(null);
const recordedVideos = new Array(NUM_TRACKS).fill(null); // Blobs for each track

// Store references to video and filmFrame for each track for easy access
const videoElements = [];
const frameDivs = [];

for (let i = 0; i < NUM_TRACKS; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.classList.add('video-track');
  videoTrackDiv.id = 'video-track-' + (i + 1);

  const filmFrameDiv = document.createElement('div');
  filmFrameDiv.classList.add('film-frame');
  frameDivs[i] = filmFrameDiv;

  const videoElement = document.createElement('video');
  videoElement.setAttribute('autoplay', 'true');
  videoElement.setAttribute('muted', 'true');
  videoElement.setAttribute('playsinline', 'true');
  videoElement.setAttribute('width', '800');
  videoElement.setAttribute('height', '450');
  videoElement.style.background = "#000";
  filmFrameDiv.appendChild(videoElement);
  videoElements[i] = videoElement;

  videoTrackDiv.appendChild(filmFrameDiv);

  const controlsDiv = document.createElement('div');
  controlsDiv.classList.add('track-controls');

  const selectButton = document.createElement('button');
  selectButton.classList.add('select-btn');
  selectButton.textContent = `🎯 Select Track ${i + 1}`;
  selectButton.addEventListener('click', async function() {
    // Deselect all tracks and remove blinking REC
    document.querySelectorAll('.video-track').forEach(div => {
      div.classList.remove('selected');
    });
    document.querySelectorAll('.blinking-rec').forEach(rec => rec.remove());

    videoTrackDiv.classList.add('selected');
    selectedTrackIndex = i;

    // Stop all other video streams
    videoStreams.forEach((stream, idx) => {
      if (stream && idx !== selectedTrackIndex) {
        stream.getTracks().forEach(track => track.stop());
        videoStreams[idx] = null;
        videoElements[idx].srcObject = null;
      }
    });

    // Show recorded video for this track if it exists
    if (recordedVideos[selectedTrackIndex]) {
      videoElement.srcObject = null;
      videoElement.src = URL.createObjectURL(recordedVideos[selectedTrackIndex]);
      videoElement.controls = true;
      videoElement.loop = true;
      videoElement.play();
    } else {
      // Show live camera preview for this track
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoElement.srcObject = stream;
        videoElement.controls = false;
        videoStreams[selectedTrackIndex] = stream;
      } catch (e) {
        alert("Camera access denied or not available.");
      }
    }
  });
  controlsDiv.appendChild(selectButton);
  videoTrackDiv.appendChild(controlsDiv);
  videoTracksContainer.appendChild(videoTrackDiv);
}

// ======= Recording logic =======
const countdownOverlay = document.getElementById('countdown-overlay');
const recButton = document.getElementById('rec-btn');
const stopRecButton = document.getElementById('stop-rec-btn');
let mediaRecorder = null;
let recordedChunks = [];
let recBlinkElem = null;
let recordingActive = false;

recButton.addEventListener('click', async () => {
  if (selectedTrackIndex === null) {
    alert("Please select a track and allow camera access first.");
    return;
  }
  const stream = videoStreams[selectedTrackIndex];
  if (!stream) {
    alert("Please select a track and allow camera access first.");
    return;
  }
  // Countdown
  await startCountdown();

  // Prepare audio
  const audioPlayer = document.getElementById('master-track');
  audioPlayer.currentTime = 0;
  if (audioPlayer.src) audioPlayer.play();

  // Blinking REC indicator
  const filmFrameDiv = frameDivs[selectedTrackIndex];
  if (filmFrameDiv) {
    const oldRec = filmFrameDiv.querySelector('.blinking-rec');
    if (oldRec) oldRec.remove();
    recBlinkElem = document.createElement('div');
    recBlinkElem.className = 'blinking-rec';
    recBlinkElem.innerHTML = '<span class="blinking-circle"></span>REC';
    filmFrameDiv.appendChild(recBlinkElem);
  }

  recButton.classList.add('hidden');
  stopRecButton.classList.remove('hidden');

  // Start recorder
  let options = {};
  if (window.MediaRecorder && MediaRecorder.isTypeSupported) {
    if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      options = { mimeType: 'video/webm;codecs=vp9' };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
      options = { mimeType: 'video/webm;codecs=vp8' };
    } else if (MediaRecorder.isTypeSupported('video/webm')) {
      options = { mimeType: 'video/webm' };
    }
  }
  try {
    mediaRecorder = new MediaRecorder(stream, options);
  } catch (e) {
    try {
      mediaRecorder = new MediaRecorder(stream);
    } catch (err) {
      alert('MediaRecorder is not supported in this browser or with this configuration.');
      if (recBlinkElem) recBlinkElem.remove();
      recButton.classList.remove('hidden');
      stopRecButton.classList.add('hidden');
      return;
    }
  }

  recordedChunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    if (recBlinkElem) recBlinkElem.remove();
    recButton.classList.remove('hidden');
    stopRecButton.classList.add('hidden');
    recordingActive = false;
    if (recordedChunks.length === 0) {
      alert('No video was recorded!');
      return;
    }
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    recordedVideos[selectedTrackIndex] = blob;

    // Always update video element in the selected track
    const videoElement = videoElements[selectedTrackIndex];
    videoElement.srcObject = null;
    videoElement.src = URL.createObjectURL(blob);
    videoElement.controls = true;
    videoElement.loop = true;
    videoElement.play();
    recordedChunks = [];
  };

  mediaRecorder.start();
  recordingActive = true;

  // Stop recording when audio ends
  audioPlayer.onended = () => {
    if (recordingActive) stopRecording();
  };
});

stopRecButton.addEventListener('click', () => {
  if (recordingActive) stopRecording();
});

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }
  const audioPlayer = document.getElementById('master-track');
  if (audioPlayer && !audioPlayer.paused) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  document.querySelectorAll('.blinking-rec').forEach(rec => rec.remove());
  recButton.classList.remove('hidden');
  stopRecButton.classList.add('hidden');
  recordingActive = false;
}

function startCountdown() {
  return new Promise(resolve => {
    countdownOverlay.classList.remove('hidden');
    let count = 3;
    countdownOverlay.textContent = count;
    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        countdownOverlay.textContent = "🎬";
      } else if (count < 0) {
        countdownOverlay.classList.add('hidden');
        clearInterval(interval);
        resolve();
      } else {
        countdownOverlay.textContent = count;
      }
    }, 900);
  });
}
