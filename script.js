document.addEventListener('DOMContentLoaded', () => {
  const videoTracksContainer = document.getElementById('video-tracks-container');

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
  }

  document.querySelectorAll('.video-track').forEach(track => {
    const recordBtn = track.querySelector('.record-btn');
    const uploadBtn = track.querySelector('.upload-btn');
    const deleteBtn = track.querySelector('.delete-btn');
    const preview = track.querySelector('.preview');
    const indicator = track.querySelector('.recording-indicator');

    let mediaRecorder;
    let stream;
    let recordedChunks = [];

    recordBtn.addEventListener('click', async () => {
      if (mediaRecorder && mediaRecorder.state === 'recording') {
        console.log("Stopping recording...");
        mediaRecorder.stop();
        recordBtn.textContent = '🎥 Record';
        indicator.classList.remove('blinking');
      } else {
        try {
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

            if (stream) {
              stream.getTracks().forEach(track => track.stop());
            }
            indicator.classList.remove('blinking');
          };

          mediaRecorder.start();
          recordBtn.textContent = '⏹ Stop';
          indicator.classList.add('blinking');
        } catch (err) {
          console.error('Error accessing media devices:', err);
          alert('Camera access denied or unavailable. Please check your camera settings.');
        }
      }
    });

    uploadBtn.addEventListener('click', () => {
      alert(`Upload functionality for ${track.querySelector('h3').textContent} will be implemented soon.`);
    });

    deleteBtn.addEventListener('click', () => {
      preview.pause();
      preview.removeAttribute('src');
      preview.load();
      recordedChunks = [];
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      recordBtn.textContent = '🎥 Record';
      indicator.classList.remove('blinking');
    });
  });
});
