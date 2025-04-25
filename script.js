document.addEventListener('DOMContentLoaded', function () {
  const videoTracksContainer = document.getElementById('video-tracks');

  [...Array(10)].forEach((_, i) => {
    const trackDiv = document.createElement('div');
    trackDiv.classList.add('video-track');
    trackDiv.innerHTML = `
      <h3>Video Track ${i + 1}</h3>
      <button class="record-btn">🎥 Record</button>
      <button class="upload-btn">📁 Upload</button>
      <input type="file" class="upload-input" accept="video/*" style="display:none">
      <video class="preview" controls></video>
      <div class="spinner"></div>
      <button class="delete-btn">❌ Delete</button>
    `;

    const uploadBtn = trackDiv.querySelector('.upload-btn');
    const uploadInput = trackDiv.querySelector('.upload-input');
    const videoPreview = trackDiv.querySelector('.preview');
    const deleteBtn = trackDiv.querySelector('.delete-btn');
    const recordBtn = trackDiv.querySelector('.record-btn');

    let mediaRecorder;
    let recordedChunks = [];

    // 🎥 Handle RECORD button click
    recordBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        videoPreview.srcObject = stream;
        videoPreview.muted = true;
        videoPreview.play();

        mediaRecorder = new MediaRecorder(stream);
        recordedChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          videoPreview.srcObject = null;
          videoPreview.src = videoURL;
          videoPreview.controls = true;
        };

        mediaRecorder.start();

        // Auto-stop after 10 seconds
        setTimeout(() => {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
        }, 10000);
      } catch (err) {
        alert("Error accessing camera: " + err.message);
        console.error(err);
      }
    });

    // Upload file
    uploadBtn.addEventListener('click', () => uploadInput.click());
    uploadInput.addEventListener('change', function () {
      const file = uploadInput.files[0];
      if (file) {
        const videoURL = URL.createObjectURL(file);
        videoPreview.src = videoURL;
        videoPreview.style.display = 'block';
      }
    });

    // Delete
    deleteBtn.addEventListener('click', () => trackDiv.remove());

    videoTracksContainer.appendChild(trackDiv);
  });
});
