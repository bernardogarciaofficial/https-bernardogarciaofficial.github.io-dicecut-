const videoTracksContainer = document.getElementById('video-tracks-container');
const masterUpload = document.getElementById('master-track-upload');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const mixBtn = document.getElementById('mix-btn');
const masterTrack = document.getElementById('master-track');

// Create video tracks dynamically
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

  const recordBtn = trackDiv.querySelector('.record-btn');
  const uploadBtn = trackDiv.querySelector('.upload-btn');
  const deleteBtn = trackDiv.querySelector('.delete-btn');
  const preview = trackDiv.querySelector('.preview');
  const indicator = trackDiv.querySelector('.recording-indicator');

  let mediaRecorder;
  let stream;
  let recordedChunks = [];

  // Start/Stop recording
  recordBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      recordBtn.textContent = '🎥 Record';
      indicator.classList.remove('blinking'); // Stop blinking indicator when recording stops
    } else {
      try {
        // Request video and audio stream from webcam and microphone
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        preview.srcObject = stream;
        preview.muted = true;
        preview.play();

        // Prepare MediaRecorder
        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        // Collect recorded data
        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        // When recording stops, save the video and display it
        mediaRecorder.onstop = () => {
          if (recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoURL = URL.createObjectURL(blob);
            preview.srcObject = null; // Remove the stream
            preview.src = videoURL; // Set the recorded video URL
            preview.controls = true;
            preview.play();
          }

          if (stream) stream.getTracks().forEach(track => track.stop());
          indicator.classList.remove('blinking'); // Stop blinking indicator after video is saved
        };

        // Start recording
        mediaRecorder.start();
        recordBtn.textContent = '⏹ Stop'; // Change button text when recording starts
        indicator.classList.add('blinking'); // Add blinking indicator when recording starts
      } catch (err) {
        alert('Camera access denied or unavailable.');
        console.error(err);
      }
    }
  });

  // Delete button - Clear video and reset
  deleteBtn.addEventListener('click', () => {
    preview.src = '';
    preview.srcObject = null;
    preview.pause();
    indicator.classList.remove('blinking'); // Stop blinking light when video is deleted
  });

  // Upload button - File input for uploading a video
  uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        const videoURL = URL.createObjectURL(file);
        preview.src = videoURL;
        preview.controls = true;
        preview.play();
      }
    };

    input.click();
  });
}
  
