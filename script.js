// Grab elements
const videoTracksContainer = document.getElementById('video-tracks-container');

// Loop to create 10 video tracks
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

  // Grab the buttons and video element for each track
  const recordBtn = trackDiv.querySelector('.record-btn');
  const preview = trackDiv.querySelector('.preview');
  const indicator = trackDiv.querySelector('.recording-indicator');
  let mediaRecorder;
  let stream;
  let recordedChunks = [];

  // Start and stop recording logic
  recordBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      // Stop recording
      mediaRecorder.stop();
      recordBtn.textContent = '🎥 Record'; // Change button text to "Record"
      indicator.classList.remove('blinking'); // Stop blinking indicator
    } else {
      try {
        // Get user media (video and audio)
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        preview.srcObject = stream;
        preview.muted = true; // Mute the preview video
        preview.play();

        // Prepare the media recorder
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        // When data is available, push it to the recordedChunks array
        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        // When recording stops, process and display the video
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          preview.srcObject = null; // Disconnect stream
          preview.src = videoURL; // Set video URL to the preview
          preview.controls = true; // Enable controls for playback
          preview.play(); // Play the recorded video

          // Stop all tracks of the stream
          if (stream) stream.getTracks().forEach(track => track.stop());
          indicator.classList.remove('blinking'); // Stop blinking indicator
        };

        // Start recording
        mediaRecorder.start();
        recordBtn.textContent = '⏹ Stop'; // Change button text to "Stop"
        indicator.classList.add('blinking'); // Start blinking indicator
      } catch (err) {
        alert('Camera access denied or unavailable.');
        console.error(err);
      }
    }
  });
}
