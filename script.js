// Get the container where video tracks will be appended
const videoTracksContainer = document.getElementById('video-tracks-container');

// Create 10 video tracks dynamically
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
}

// Initialize an empty array to keep track of video streams
const videoStreams = [];

// Get all record buttons
const recordBtns = document.querySelectorAll('.record-btn');
const previewVideos = document.querySelectorAll('.preview');
const recordingIndicators = document.querySelectorAll('.recording-indicator');

// Function to start recording video
async function startRecording(index) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoStreams[index] = stream;
    previewVideos[index].srcObject = stream;
    recordingIndicators[index].style.backgroundColor = 'red'; // Show the red recording indicator

    // Optionally, we can start recording audio and video here with MediaRecorder
    // For simplicity, this is just setting up the video preview

  } catch (err) {
    console.error('Camera access denied or unavailable:', err);
  }
}

// Function to stop recording
function stopRecording(index) {
  const stream = videoStreams[index];
  if (stream) {
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop());
    previewVideos[index].srcObject = null; // Clear the preview
    recordingIndicators[index].style.backgroundColor = 'transparent'; // Remove the red indicator
  }
}

// Add event listeners to record buttons
recordBtns.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (videoStreams[index]) {
      stopRecording(index); // Stop recording if it's already recording
    } else {
      startRecording(index); // Start recording
    }
  });
});

// Add event listeners for upload and delete buttons
const uploadBtns = document.querySelectorAll('.upload-btn');
const deleteBtns = document.querySelectorAll('.delete-btn');

uploadBtns.forEach((button, index) => {
  button.addEventListener('click', () => {
    alert(`Upload functionality for Video Track ${index + 1} will be implemented soon.`);
  });
});

deleteBtns.forEach((button, index) => {
  button.addEventListener('click', () => {
    alert(`Delete functionality for Video Track ${index + 1} will be implemented soon.`);
  });
});
