
const videoTracksContainer = document.getElementById('video-tracks-container');
const masterTrackUpload = document.getElementById('master-track-upload');
const masterTrack = document.getElementById('master-track');

masterTrackUpload.addEventListener('change', () => {
  const file = masterTrackUpload.files[0];
  if (file) {
    masterTrack.src = URL.createObjectURL(file);
    masterTrack.play();
  }
});

for (let i = 1; i <= 10; i++) {
  const trackDiv = document.createElement('div');
  trackDiv.className = 'video-track';
  trackDiv.innerHTML = `
    <h3>Video Track ${i}</h3>
    <div class="track-buttons">
      <button class="record-btn">🎥 Record</button>
      <button class="upload-btn">📁 Upload</button>
      <button class="delete-btn">❌ Delete</button>
      <div class="recording-indicator"></div>
    </div>
    <video class="preview" controls></video>
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
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          preview.srcObject = null;
          preview.src = videoURL;
          preview.controls = true;
          preview.muted = false;
          preview.play();

          stream.getTracks().forEach(track => track.stop());
          indicator.classList.remove('blinking');
        };

        mediaRecorder.start();
        recordBtn.textContent = '⏹ Stop';
        indicator.classList.add('blinking');
      } catch (err) {
        alert('Camera access denied or unavailable.');
      }
    }
  });

  uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        preview.src = URL.createObjectURL(file);
        preview.controls = true;
      }
    };
    input.click();
  });

  deleteBtn.addEventListener('click', () => {
    preview.src = '';
    preview.srcObject = null;
  });
}
