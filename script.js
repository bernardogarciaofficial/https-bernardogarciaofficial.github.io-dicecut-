// Toggle between light and dark mode
document.getElementById('theme-toggle-checkbox').addEventListener('change', function () {
  document.body.classList.toggle('dark-mode', this.checked);
});

// Generate the video tracks dynamically
window.onload = function () {
  const videoTracksContainer = document.getElementById('video-tracks');
  const tracks = [...Array(10)].map((_, i) => `
    <div class="video-track">
      <h3>Video Track ${i + 1}</h3>
      <button class="record-btn">🎥 Record</button>
      <button class="upload-btn">📁 Upload</button>
      <button class="delete-btn">❌ Delete</button>
      <video class="preview" controls></video>
      <div class="spinner"></div>
    </div>
  `).join('');
  videoTracksContainer.innerHTML = tracks;

  // Add event listeners to Delete buttons
  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
      const videoTrack = this.closest('.video-track');
      videoTrack.remove();
    });
  });
};
