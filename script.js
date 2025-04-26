document.addEventListener('DOMContentLoaded', function () {
  const videoTracksContainer = document.getElementById('video-tracks-container');

  // Loop through video tracks (10 in total)
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

    // Get elements for each video track
    const recordBtn = trackDiv.querySelector('.record-btn');
    const uploadBtn = trackDiv.querySelector('.upload-btn');
    const deleteBtn = trackDiv.querySelector('.delete-btn');
    const preview = trackDiv.querySelector('.preview');
    const recordingIndicator = trackDiv.querySelector('.recording-indicator');

    // Implement the Upload functionality
    uploadBtn.addEventListener('click', function () {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'video/*'; // Limit to video files

      fileInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
          const videoURL = URL.createObjectURL(file);
          preview.src = videoURL;  // Set the video URL to the preview element
        }
      });

      // Trigger the file input
      fileInput.click();
    });

    // Implement the Delete functionality
    deleteBtn.addEventListener('click', function () {
      preview.src = '';  // Clear the video source
    });
  }
});
