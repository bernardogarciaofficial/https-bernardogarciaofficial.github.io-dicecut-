document.addEventListener("DOMContentLoaded", function () {
  const videoTracksContainer = document.getElementById("video-tracks-container");
  const memberCountElement = document.getElementById("member-count");
  const lightDarkModeToggle = document.getElementById("light-dark-mode-toggle");
  let isDarkMode = false;

  // Create 10 video tracks dynamically
  for (let i = 1; i <= 10; i++) {
    const videoTrackDiv = document.createElement("div");
    videoTrackDiv.classList.add("video-track");
    videoTrackDiv.innerHTML = `
      <h3>Video Track ${i}</h3>
      <button class="record-btn">🎥 Record</button>
      <button class="upload-btn">📁 Upload</button>
      <button class="delete-btn">❌ Delete</button>
      <video class="preview" controls></video>
      <div class="spinner" style="display: none;"></div>
    `;
    videoTracksContainer.appendChild(videoTrackDiv);
  }

  // Initialize light/dark mode toggle
  lightDarkModeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    document.body.classList.toggle("light-mode");
    isDarkMode = !isDarkMode;
  });

  // Fetch and update member count from the backend
  fetch('get_member_count.php')
    .then(response => response.json())
    .then(data => {
      if (data && data.memberCount !== undefined) {
        memberCountElement.textContent = data.memberCount;
      } else {
        memberCountElement.textContent = "Unavailable";
      }
    })
    .catch(error => {
      console.error('Error fetching member count:', error);
      memberCountElement.textContent = "Unavailable";
    });

  // Record functionality
  const recordBtns = document.querySelectorAll(".record-btn");
  recordBtns.forEach((recordBtn, index) => {
    recordBtn.addEventListener("click", async () => {
      try {
        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });

        // If camera is available, show the preview
        const preview = document.querySelectorAll("video.preview")[index];
        preview.srcObject = stream;
        preview.style.display = 'block';
        preview.play();
      } catch (err) {
        // Handle permission denied or other errors
        alert("Camera access denied or unavailable. Please check your camera settings.");
        console.error("Error accessing camera:", err);
      }
    });
  });

  // Upload functionality
  const uploadBtns = document.querySelectorAll(".upload-btn");
  uploadBtns.forEach((uploadBtn, index) => {
    uploadBtn.addEventListener("click", () => {
      alert("Upload functionality will be implemented here.");
    });
  });

  // Delete functionality
  const deleteBtns = document.querySelectorAll(".delete-btn");
  deleteBtns.forEach((deleteBtn, index) => {
    deleteBtn.addEventListener("click", () => {
      alert("Delete functionality will be implemented here.");
    });
  });
});
