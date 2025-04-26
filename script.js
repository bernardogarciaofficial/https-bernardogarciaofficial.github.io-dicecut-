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

  const recordBtn = trackDiv.querySelector('.record-btn');
  const uploadBtn = trackDiv.querySelector('.upload-btn');
  const deleteBtn = trackDiv.querySelector('.delete-btn');
  const preview = trackDiv.querySelector('.preview');
  const indicator = trackDiv.querySelector('.recording-indicator');

  let mediaRecorder = null;
  let recordedChunks = [];
  let stream = null;

  recordBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
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

        mediaRecorder.ondataavailable = event => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          if (recordedChunks.length) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoURL = URL.createObjectURL(blob);
            preview.srcObject = null;
            preview.src = videoURL;
            preview.muted = false;
            preview.play();
          }

          stream.getTracks().forEach(track => track.stop());
          indicator.classList.remove('blinking');
        };

        mediaRecorder.start();
        recordBtn.textContent = '⏹ Stop';
        indicator.classList.add('blinking');
      } catch (err) {
        console.error(err);
        alert('Camera access denied or unavailable. Please check your camera settings.');
      }
    }
  });

  uploadBtn.addEventListener('click', () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';
    fileInput.onchange = e => {
      const file = e.target.files[0];
      if (file) {
        const videoURL = URL.createObjectURL(file);
        preview.src = videoURL;
        preview.play();
      }
    };
    fileInput.click();
  });

  deleteBtn.addEventListener('click', () => {
    preview.pause();
    preview.removeAttribute('src');
    preview.load();
    preview.srcObject = null;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    recordedChunks = [];
  });
}
