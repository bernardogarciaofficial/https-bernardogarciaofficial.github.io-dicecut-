// ==== Handle audio upload and playback ====
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
const videoStreams = Array(10).fill(null);
const recordedVideos = Array(10).fill(null); // Store blobs for each track

// Create video tracks and UI
for (let i = 1; i <= 10; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.classList.add('video-track');
  videoTrackDiv.id = 'video-track-' + i;

  const filmFrameDiv = document.createElement('div');
  filmFrameDiv.classList.add('film-frame');

  // --- This video element will show the recorded video for this track ---
  const videoElement = document.createElement('video');
  videoElement.setAttribute('autoplay', 'true');
  videoElement.setAttribute('muted', 'true');
  videoElement.setAttribute('playsinline', 'true');
  videoElement.setAttribute('width', '800');
  videoElement.setAttribute('height', '450');
  videoElement.style.background = "#000";

  filmFrameDiv.appendChild(videoElement);

  const controlsDiv = document.createElement('div');
  controlsDiv.classList.add('track-controls');

  const selectButton = document.createElement('button');
  selectButton.classList.add('select-btn');
  selectButton.textContent = `🎯 Select Track ${i}`;
  selectButton.addEventListener('click', async function() {
    document.querySelectorAll('.video-track').forEach(div => {
      div.classList.remove('selected');
      const blink = div.querySelector('.blinking-rec');
      if (blink) blink.remove();
    });
    videoTrackDiv.classList.add('selected');
    selectedTrackIndex = i - 1;

    // Stop all other video streams
    videoStreams.forEach((stream, idx) => {
      if (stream && idx !== selectedTrackIndex) {
        stream.getTracks().forEach(track => track.stop());
        videoStreams[idx] = null;
        const ve = document.querySelector(`#video-track-${idx + 1} video`);
        if (ve) ve.srcObject = null;
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
        if (!videoStreams[selectedTrackIndex]) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          videoElement.srcObject = stream;
          videoElement.controls = false;
          videoStreams[selectedTrackIndex] = stream;
        } else {
          videoElement.srcObject = videoStreams[selectedTrackIndex];
          videoElement.controls = false;
        }
      } catch (e) {
        alert("Camera access denied or not available.");
      }
    }
  });

  controlsDiv.appendChild(selectButton);

  if (i >= 8) {
    const uploadButton = document.createElement('button');
    uploadButton.classList.add('upload-btn');
    uploadButton.textContent = '📂 Upload Video';
    uploadButton.addEventListener('click', () => {
      alert(`Upload video for Track ${i}`);
    });
    controlsDiv.appendChild(uploadButton);
  }

  videoTrackDiv.appendChild(filmFrameDiv);
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
let audioPlayer = document.getElementById('master-track');
let recordingActive = false;

recButton.addEventListener('click', async () => {
  if (selectedTrackIndex === null) {
    alert("Please select a track and allow camera access first.");
    return;
  }
  audioPlayer = document.getElementById('master-track');
  const stream = videoStreams[selectedTrackIndex];
  if (!stream) {
    alert("Please select a track and allow camera access first.");
    return;
  }
  await startCountdown();

  audioPlayer.currentTime = 0;
  const audioPlayPromise = audioPlayer.play();
  if (audioPlayPromise !== undefined) {
    audioPlayPromise.catch(e => {
      alert("Could not play master track audio automatically. Please click the play ▶️ button on the audio controls once, then try recording again.");
    });
  }

  // Add blinking REC effect inside the selected film frame
  const filmFrameDiv = document.querySelector(`#video-track-${selectedTrackIndex + 1} .film-frame`);
  if (filmFrameDiv) {
    // Remove any existing rec indicator
    const oldRec = filmFrameDiv.querySelector('.blinking-rec');
    if (oldRec) oldRec.remove();
    recBlinkElem = document.createElement('div');
    recBlinkElem.className = 'blinking-rec';
    recBlinkElem.innerHTML = '<span class="blinking-circle"></span>REC';
    filmFrameDiv.appendChild(recBlinkElem);
  }

  recButton.classList.add('hidden');
  stopRecButton.classList.remove('hidden');

  // --- Most compatible MediaRecorder initialization ---
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
      mediaRecorder = new MediaRecorder(stream); // fallback to default
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
    // Save blob to the selected track and display it
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    recordedVideos[selectedTrackIndex] = blob;
    const videoTrackDiv = document.getElementById(`video-track-${selectedTrackIndex + 1}`);
    const videoElement = videoTrackDiv.querySelector('video');
    videoElement.srcObject = null;
    videoElement.src = URL.createObjectURL(blob);
    videoElement.controls = true;
    videoElement.loop = true;
    videoElement.play();
    recordedChunks = [];
  };

  mediaRecorder.start();
  recordingActive = true;

  // Automatically stop recording when audio ends
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
  if (audioPlayer && !audioPlayer.paused) {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }
  // Remove any blinking REC indicators
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

// ==== Demo buttons (still for UI demo only) ====
const diceButton = document.getElementById('dice-btn');
const option1Button = document.getElementById('option-1');
const option2Button = document.getElementById('option-2');
diceButton.addEventListener('click', () => {
  alert('Rolling the dice! Choose an option below:');
});
option1Button.addEventListener('click', () => {
  alert('Editing 8 bars at a time with automatic effects and transitions!');
});
option2Button.addEventListener('click', () => {
  alert('Editing the full video with automatic effects and transitions!');
});
const exportButton = document.getElementById('export-btn');
exportButton.addEventListener('click', () => {
  alert('Exporting video! (This is a demo action for now.)');
});
