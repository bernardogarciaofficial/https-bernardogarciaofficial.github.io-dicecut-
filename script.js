// Handle the theme toggle
const themeToggleCheckbox = document.getElementById("theme-toggle-checkbox");
themeToggleCheckbox.addEventListener("change", function () {
  document.body.classList.toggle("dark-mode", themeToggleCheckbox.checked);
});

// Generate video tracks dynamically
const videoTracksContainer = document.getElementById("video-tracks");

function generateVideoTracks() {
  const videoTracksHTML = [...Array(10)].map((_, i) => `
    <div class="video-track" id="video-track-${i + 1}">
      <h3>Video Track ${i + 1}</h3>
      <button class="record-btn">🎥 Record</button>
      <button class="upload-btn">📁 Upload</button>
      <button class="delete-btn">❌ Delete</button>
      <video class="preview" controls></video>
    </div>
  `).join('');
  videoTracksContainer.innerHTML = videoTracksHTML;
}

// Call function to generate video tracks on page load
window.onload = generateVideoTracks;

// Handle delete functionality for each video track
videoTracksContainer.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-btn")) {
    const videoTrack = event.target.closest(".video-track");
    videoTrack.remove();
  }
});
