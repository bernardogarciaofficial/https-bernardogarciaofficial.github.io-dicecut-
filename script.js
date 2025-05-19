// ==== Audio upload ====
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

// ==== Video tracks setup ====
const videoTracksContainer = document.getElementById('video-tracks-container');
let selectedTrackIndex = null;
const videoStreams = new Array(10).fill(null);
const recordedVideos = new Array(10).fill(null); // Store blobs for each track

for (let i = 0; i < 10; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.classList.add('video-track');
  videoTrackDiv.id = 'video-track-' + (i + 1);

  const filmFrameDiv = document.createElement('div');
  filmFrameDiv.classList.add('film-frame');

  const videoElement = document.createElement('video');
  videoElement.setAttribute('autoplay', 'true');
  videoElement.setAttribute('muted', 'true');
  videoElement.setAttribute('playsinline', 'true');
  videoElement.setAttribute('width', '800');
  videoElement.setAttribute('height', '450');
  videoElement.style.background = "#000";
  filmFrameDiv.appendChild(videoElement);

  videoTrackDiv.appendChild(filmFrameDiv);

  const controlsDiv = document.createElement('div');
  controlsDiv.classList.add('track-controls');

  const selectButton = document.createElement('button');
  selectButton.classList.add('select-btn');
  selectButton.textContent = `🎯 Select Track ${i + 1}`;
  selectButton.addEventListener('click', async function() {
    document.querySelectorAll('.video-track').forEach(div => {
      div.classList.remove('selected');
      const blink = div.querySelector('.blinking-rec');
      if (blink) blink.remove();
    });
    videoTrackDiv.classList.add('selected');
    selectedTrackIndex = i;

    // Stop all other video streams
    videoStreams.forEach((stream, idx) => {
      if (stream && idx !== selectedTrackIndex) {
        stream.getTracks().forEach(track => track.stop());
        videoStreams[idx] = null;
        const ve = document.querySelector(`#video-track-${idx + 1} video`);
        if (ve) ve.srcObject = null;
      }
    });

    // Show recorded video if it exists, else show camera preview
    if (recordedVideos[selectedTrackIndex]) {
      videoElement.srcObject = null;
      videoElement.src = URL.createObjectURL(recordedVideos[selectedTrackIndex]);
      videoElement.controls = true;
      videoElement.loop = true;
      videoElement.play();
    } else {
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

// ==== Recording logic ====
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
  const audioPlayer = document.getElementById('master-track');
  const stream = videoStreams[selectedTrackIndex];
  const videoTrackDiv = document.getElementById(`video-track-${selectedTrackIndex + 1}`);
  const filmFrameDiv = videoTrackDiv.querySelector('.film-frame');
  const videoElement = filmFrameDiv.querySelector('video');

  if (!stream) {
    alert("Please select a track and allow camera access first.");
    return;
  }

  // Countdown
  await startCountdown();

  audioPlayer.currentTime = 0;
  const audioPlayPromise = audioPlayer.play();
  if (audioPlayPromise !== undefined) {
    audioPlayPromise.catch(e => {
      alert("Could not play master track audio automatically. Please click the play ▶️ button on the audio controls once, then try recording again.");
    });
  }

  // Blinking REC indicator
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

  // MediaRecorder
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
      mediaRecorder = new MediaRecorder(stream); // fallback
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

    // Always update video element
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
