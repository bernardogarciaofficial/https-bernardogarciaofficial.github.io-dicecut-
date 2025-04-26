document.addEventListener('DOMContentLoaded', function () {
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
    let mediaStream = null;
    let chunks = [];
    let isRecording = false;

    // Handle Record button click
    recordBtn.addEventListener('click', async () => {
      if (!isRecording) {
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          preview.srcObject = mediaStream;
          preview.play();

          mediaRecorder = new MediaRecorder(mediaStream);
          chunks = [];

          mediaRecorder.ondataavailable = function (e) {
            if (e.data.size > 0) chunks.push(e.data);
          };

          mediaRecorder.onstop = function () {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const videoURL = URL.createObjectURL(blob);
            preview.srcObject = null;
            preview.src = videoURL;
            preview.play();

            // Stop all camera tracks
            mediaStream.getTracks().forEach(track => track.stop());
            isRecording = false;
            indicator.classList.remove('blinking');
            recordBtn.textContent = '🎥 Record';
          };

          mediaRecorder.start();
          isRecording = true;
          indicator.classList.add('blinking');
          recordBtn.textContent = '⏹ Stop';

        } catch (err) {
          alert('Camera access denied or unavailable. Please check your camera settings.');
          console.error(err);
        }
      } else {
        mediaRecorder.stop(); // Stop recording
      }
    });

    // Upload video
    uploadBtn.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/*';
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const videoURL = URL.createObjectURL(file);
          preview.src = videoURL;
        }
      });
      fileInput.click();
    });

    // Delete video
    deleteBtn.addEventListener('click', () => {
      preview.src = '';
      preview.srcObject = null;
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      indicator.classList.remove('blinking');
      recordBtn.textContent = '🎥 Record';
      isRecording = false;
    });
  }
});
