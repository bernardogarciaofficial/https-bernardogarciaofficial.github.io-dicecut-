const videoTracksContainer = document.getElementById('video-tracks-container');
const masterTrack = document.getElementById('master-track');
const masterTrackUpload = document.getElementById('master-track-upload');
let mediaRecorder;
let recordedChunks = [];
let stream;
let preview;
let indicator;
let currentVideoIndex = 0;

for (let i = 1; i <= 10; i++) {
  const trackDiv = document.createElement('div');
  trackDiv.className = 'video-track';
  trackDiv.innerHTML = `
    <h3>Video Track ${i}</h3>
    <button class="record-btn">🎥 Record</button>
    <button class="upload-btn">📁 Upload</button>
    <button class="delete-btn">❌ Delete</button>
    <video class="preview" controls></video>
    <div class="recording-indicator"></div>
  `;
  videoTracksContainer.appendChild(trackDiv);

  const recordButton = trackDiv.querySelector('.record-btn');
  const preview = trackDiv.querySelector('.preview');
  const indicator = trackDiv.querySelector('.recording-indicator');

  recordButton.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      console.log("Stopping recording...");
      mediaRecorder.stop();
      recordButton.textContent = '🎥 Record';
      indicator.classList.remove('blinking');
    } else {
      try {
        // Start recording when the master track starts
        if (masterTrack.paused) {
          alert('Please play the master track to start recording videos!');
          return;
        }

        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        preview.srcObject = stream;
        preview.muted = true;
        preview.play();

        recordedChunks = [];

        mediaRecorder = new MediaRecorder(stream);
        console.log("Started recording...");

        mediaRecorder.ondataavailable = event => {
          console.log("Data available:", event.data);
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          console.log("Recording stopped.");
          if (recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoURL = URL.createObjectURL(blob);
            preview.srcObject = null;
            preview.src = videoURL;
            preview.muted = false;
            preview.controls = true;
            preview.play();
            console.log("Playback started.");
          } else {
            console.warn("No recorded chunks available.");
          }

          // Stop all tracks when recording is stopped
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          indicator.classList.remove('blinking');
        };

        mediaRecorder.start();
        recordButton.textContent = '⏹ Stop';
        indicator.classList.add('blinking');
      } catch (err) {
        console.error('Error accessing media devices:', err);
        alert('Camera access denied or unavailable. Please check your camera settings.');
      }
    }
  });
}

// Handle master track file upload
masterTrackUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    masterTrack.src = url;
    masterTrack.play();
  }
});

// Sync video tracks with the master track
masterTrack.addEventListener('play', () => {
  // Start the video tracks when the master track starts playing
  const videoTracks = document.querySelectorAll('.video-track .record-btn');
  videoTracks.forEach((button, index) => {
    button.disabled = false;  // Enable the record buttons when the master track plays
  });
});
