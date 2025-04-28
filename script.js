// Get DOM elements
const masterTrackUpload = document.getElementById("master-track-upload");
const masterTrack = document.getElementById("master-track");
const recordBtn = document.getElementById("record-btn");
const indicator = document.getElementById("indicator");
const videoTracksContainer = document.getElementById("video-tracks-container");

// Handle audio file upload
masterTrackUpload.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const audioURL = URL.createObjectURL(file);
    masterTrack.src = audioURL;
    masterTrack.play();
  }
});

// Handle record button click (this will just simulate recording for now)
recordBtn.addEventListener("click", function () {
  // Simulate starting recording with visual feedback
  indicator.style.display = "block";
  indicator.textContent = "Recording...";

  setTimeout(function () {
    indicator.textContent = "Recording Stopped";
    setTimeout(() => {
      indicator.style.display = "none";
    }, 1000);
  }, 5000); // Simulate a 5 second recording
});

// Dynamically generate video tracks
for (let i = 1; i <= 10; i++) {
  const videoTrack = document.createElement("div");
  videoTrack.classList.add("video-track");

  const videoElement = document.createElement("video");
  videoElement.setAttribute("autoplay", "true");
  videoElement.setAttribute("muted", "true");
  videoTrack.appendChild(videoElement);

  const selectButton = document.createElement("button");
  selectButton.classList.add("select-btn");
  selectButton.textContent = "🎯 Select to Record";
  videoTrack.appendChild(selectButton);

  videoTracksContainer.appendChild(videoTrack);

  // Handle selecting video to record
  selectButton.addEventListener("click", function () {
    videoTrack.classList.toggle("selected");
  });
}

// Light/Dark Mode functionality
const toggleThemeBtn = document.getElementById("toggle-theme");

toggleThemeBtn.addEventListener("click", function () {
  document.body.classList.toggle("dark-theme");
  toggleThemeBtn.textContent =
    document.body.classList.contains("dark-theme") ? "🌕 Light Mode" : "🌗 Dark Mode";
});

// Handle "Roll the Dice" button functionality
const rollDiceBtn = document.getElementById("roll-dice-btn");

rollDiceBtn.addEventListener("click", function () {
  alert("🎲 Dice Rolled!");
});

// Handle "Tap to Mix" button functionality
const mixBtn = document.getElementById("mix-btn");

mixBtn.addEventListener("click", function () {
  alert("🎶 Mixing Music!");
});
