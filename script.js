document.addEventListener("DOMContentLoaded", () => {
  const videoTracksContainer = document.getElementById("video-tracks");

  // Create 10 video track blocks dynamically
  for (let i = 1; i <= 10; i++) {
    const track = document.createElement("div");
    track.classList.add("video-track");
    track.innerHTML = `
      <h3>Video Track ${i}</h3>
      <button class="record-btn">🎥 Record</button>
      <button class="upload-btn">📁 Upload</button>
      <video class="preview" controls></video>
      <button class="delete-btn">❌ Delete</button>
      <div class="spinner"></div>
    `;
    videoTracksContainer.appendChild(track);
  }

  // Toggle light/dark mode
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
  });

  // Delete music track
  const musicInput = document.getElementById("music-input");
  const deleteMusic = document.getElementById("delete-music");
  deleteMusic.addEventListener("click", () => {
    musicInput.value = "";
  });

  // Handle delete for each video track
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const track = e.target.closest(".video-track");
      if (track) track.remove();
    });
  });

  // Placeholder dice logic (we’ll expand this later)
  window.rollDice = function () {
    alert("
