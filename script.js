// Get the elements for all the video tracks
document.querySelectorAll('.record-btn').forEach((button, index) => {
  button.addEventListener('click', async function () {
    const videoTrack = document.getElementById(`video-track-${index + 1}`);
    const previewVideo = videoTrack.querySelector('.preview');
    
    try {
      // Get user media (camera feed)
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Assign the stream to the video element (preview)
      previewVideo.srcObject = stream;
      previewVideo.style.display = "block";  // Show the video preview

      // Change the button text to "Stop" after recording has started
      button.textContent = "🎥 Stop Recording";
      
      // Optionally, you can handle stopping the recording and stream when clicked again
      button.addEventListener('click', () => {
        // Stop the stream if needed when clicking again
        let tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        previewVideo.style.display = "none";  // Hide the video preview
        button.textContent = "🎥 Record";  // Reset button text
      });
      
    } catch (err) {
      console.error("Error accessing camera: ", err);
    }
  });
});

// Handle the file upload for each video track
document.querySelectorAll('.upload-btn').forEach((button, index) => {
  button.addEventListener('click', function () {
    const videoTrack = document.getElementById(`video-track-${index + 1}`);
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'video/*';

    // Trigger the file selection
    fileInput.click();

    fileInput.addEventListener('change', function (event) {
      const file = event.target.files[0];
      if (file) {
        const previewVideo = videoTrack.querySelector('.preview');
        const objectURL = URL.createObjectURL(file);
        previewVideo.src = objectURL;
        previewVideo.style.display = "block";  // Show the video preview
      }
    });
  });
});

// Handle the delete button for each video track
document.querySelectorAll('.delete-btn').forEach((button, index) => {
  button.addEventListener('click', function () {
    const videoTrack = document.getElementById(`video-track-${index + 1}`);
    const previewVideo = videoTrack.querySelector('.preview');
    previewVideo.src = "";  // Clear the video
    previewVideo.style.display = "none";  // Hide the video preview
  });
});

// Handle the Roll Dice and Mix buttons
document.getElementById('roll-dice-btn').addEventListener('click', function () {
  // Add functionality for rolling dice (e.g., random selection, etc.)
  console.log("Rolling the dice...");
});

document.getElementById('mix-btn').addEventListener('click', function () {
  // Add functionality for mixing the tracks (e.g., mixing audio or video effects)
  console.log("Mixing the tracks...");
});

