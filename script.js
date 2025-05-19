 // Handle audio upload and playback
document.getElementById('master-track-upload').addEventListener('change', function(event) {
  const audioPlayer = document.getElementById('master-track');
  const audioSource = document.getElementById('audio-source');
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    audioSource.src = objectURL;
    audioPlayer.load();
    audioPlayer.play();
  }
});

// Generate video tracks dynamically
const videoTracksContainer = document.getElementById('video-tracks-container');

// Keep track of video streams and selected track
let selectedTrackIndex = null;
const videoStreams = Array(10).fill(null);

for (let i = 1; i <= 10; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.classList.add('video-track');
  videoTrackDiv.id = 'video-track-' + i;

  // Film frame for large video
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

  // Controls container (row below video)
  const controlsDiv = document.createElement('div');
  controlsDiv.classList.add('track-controls');

  const selectButton = document.createElement('button');
  selectButton.classList.add('select-btn');
  selectButton.textContent = `🎯 Select Track ${i}`;
  selectButton.addEventListener('click', async function() {
    // Deselect all, select this, show camera
    document.querySelectorAll('.video-track').forEach(div => div.classList.remove('selected'));
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

    // Request camera and display preview
    try {
      if (!videoStreams[selectedTrackIndex]) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        videoElement.srcObject = stream;
        videoStreams[selectedTrackIndex] = stream;
      } else {
        videoElement.srcObject = videoStreams[selectedTrackIndex];
      }
    } catch (e) {
      alert("Camera access denied or not available.");
    }
  });

  controlsDiv.appendChild(selectButton);

  // Add upload button for tracks 8, 9, and 10
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

// Countdown and recording logic
const countdownOverlay = document.getElementById('countdown-overlay');
const recButton = document.getElementById('rec-btn');
let mediaRecorder = null;
let recordedChunks = [];
let recordingVideoElement = null;

recButton.addEventListener('click', async () => {
  if (selectedTrackIndex === null) {
    alert("Please select a track and allow camera access first.");
    return;
  }
  const audioPlayer = document.getElementById('master-track');
  // Camera stream must be available for recording
  const stream = videoStreams[selectedTrackIndex];
  if (!stream) {
    alert("Please select a track and allow camera access first.");
    return;
  }

  // Start countdown
  await startCountdown();

  // Play master track from start
  audioPlayer.currentTime = 0;
  audioPlayer.play();

  // Start video recording
  recordingVideoElement = document.querySelector(`#video-track-${selectedTrackIndex + 1} video`);
  if (!recordingVideoElement) return;

  // Add audio to stream if desired (for now, video only)
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  recordedChunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };
  mediaRecorder.onstop = () => {
    // Optionally: preview or save the recording
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    // For a more advanced app, we'd save or let user download the file!
  };
  mediaRecorder.start();

  // Stop recording when audio ends
  audioPlayer.onended = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
    }
  };
});

// Simple 3-2-1 countdown animation
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

// Dice randomization logic
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

// Export video button (for demonstration)
const exportButton = document.getElementById('export-btn');
exportButton.addEventListener('click', () => {
  alert('Exporting video! (This is a demo action.)');
});
