// Get the elements
const themeToggle = document.getElementById('theme-toggle-checkbox');
const videoTracksContainer = document.getElementById('video-tracks');

// Function to toggle light/dark theme
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', themeToggle.checked);
});

// Function to generate video tracks dynamically
function generateVideoTracks() {
  const numberOfTracks = 10; // We want 10 video tracks
  let videoTracksHTML = '';

  // Loop to create the video track HTML
  for (let i = 1; i <= numberOfTracks; i++) {
    videoTracksHTML += `
      <div class="video-track" id="video-track-${i}">
        <h3>Video Track ${i}</h3>
        <button class="record-btn">🎥 Record</button>
        <button class="upload-btn">📁 Upload</button>
        <button class="delete-btn">❌ Delete</button>
        <video class="preview" controls></video>
      </div>
    `;
  }

  // Insert the generated video track HTML into the container
  videoTracksContainer.innerHTML = videoTracksHTML;

  // Now handle the event listeners for the dynamically created buttons
  const recordBtns = document.querySelectorAll('.record-btn');
  const uploadBtns = document.querySelectorAll('.upload-btn');
  const deleteBtns = document.querySelectorAll('.delete-btn');
  const previews = document.querySelectorAll('.preview');

  recordBtns.forEach((button, index) => {
    button.addEventListener('click', () => startRecording(index));
  });

  uploadBtns.forEach((button, index) => {
    button.addEventListener('click', () => uploadFile(index));
  });

  deleteBtns.forEach((button, index) => {
    button.addEventListener('click', () => deleteTrack(index));
  });
}

// Function to start recording video
async function startRecording(trackIndex) {
  const videoElement = document.querySelector(`#video-track-${trackIndex + 1} .preview`);
  
  try {
    // Request access to webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoElement.srcObject = stream;
    videoElement.play();

    // You can now implement further logic for video recording
    // For example, use MediaRecorder API to record the stream if needed

    // Log to confirm successful video access
    console.log('Recording started for Video Track ' + (trackIndex + 1));
  } catch (error) {
    console.error('Error accessing camera: ', error);
  }
}

// Function to upload video file (you can customize it)
function uploadFile(trackIndex) {
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'video/*';

  fileInput.onchange = function (e) {
    const file = e.target.files[0];
    const videoElement = document.querySelector(`#video-track-${trackIndex + 1} .preview`);

    // Set the uploaded video as the source
    const videoURL = URL.createObjectURL(file);
    videoElement.src = videoURL;

    // Log to confirm file upload
    console.log('Video uploaded for Video Track ' + (trackIndex + 1));
  };

  fileInput.click();
}

// Function to delete video track
function deleteTrack(trackIndex) {
  const trackElement = document.getElementById(`video-track-${trackIndex + 1}`);
  trackElement.remove();
  console.log('Deleted Video Track ' + (trackIndex + 1));
}

// Call the function to generate video tracks when the page loads
generateVideoTracks();

// Optional: Add any additional functions you might need
// For example: For the 'Roll the Dice' and 'Mix' buttons
