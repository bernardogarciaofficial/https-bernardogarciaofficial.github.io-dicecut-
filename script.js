// Light/Dark Mode Toggle
const themeToggleCheckbox = document.getElementById("theme-toggle-checkbox");
themeToggleCheckbox.addEventListener("change", function() {
  document.body.classList.toggle("dark-mode", themeToggleCheckbox.checked);
});

// Function to create video tracks dynamically
const videoTracksContainer = document.getElementById("video-tracks");

function createVideoTrack(index) {
  const track = document.createElement("div");
  track.classList.add("video-track");

  track.innerHTML = `
    <h3>Video Track ${index}</h3>
    <button class="record-btn">🎥 Record</button>
    <button class="upload-btn">📁 Upload</button>
    <button class="delete-btn">❌ Delete</button>
    <video class="preview" controls></video>
    <div class="spinner"></div>
  `;

  const deleteBtn = track.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => {
    track.remove(); // Remove the video track from the DOM
  });

  return track;
}

// Insert 10 video tracks into the page
for (let i = 1; i <= 10; i++) {
  videoTracksContainer.appendChild(createVideoTrack(i));
}
