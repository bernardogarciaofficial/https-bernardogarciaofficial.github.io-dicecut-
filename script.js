const recordBtns = document.querySelectorAll('.record-btn');

// Loop through each record button and add the event listener
recordBtns.forEach((btn, index) => {
  let mediaRecorder;
  let stream;
  let isRecording = false;
  let chunks = [];

  btn.addEventListener('click', async () => {
    const videoTrack = document.querySelector(`#video-track-${index + 1} video`);
    const recordButton = btn;
    const videoContainer = document.querySelector(`#video-track-${index + 1}`);
    const recordingIndicator = document.querySelector(`#video-track-${index + 1} .recording-indicator`);
    
    // If currently recording, stop the recording
    if (isRecording) {
      mediaRecorder.stop();
      recordButton.textContent = "🎥 Record";  // Reset button text
      videoContainer.style.border = ""; // Reset border style
      recordingIndicator.style.display = "none"; // Stop blinking indicator
      isRecording = false;
    } else {
      try {
        // Request user media (camera) access
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Set the video source to the camera stream for preview
        videoTrack.srcObject = stream;

        // Initialize media recorder
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          videoTrack.srcObject = null;  // Reset the camera stream
          videoTrack.src = videoURL;  // Set recorded video as the source
          chunks = [];  // Reset chunks array
        };
        
        // Start recording
        mediaRecorder.start();
        recordButton.textContent = "⏺ Stop Recording";  // Change button text
        videoContainer.style.border = "5px solid red"; // Show red border while recording
        recordingIndicator.style.display = "block"; // Show the blinking red light
        isRecording = true;
      } catch (error) {
        // Handle error if access is denied or unavailable
        alert("Camera access denied or unavailable. Please check your camera settings.");
      }
    }
  });
});
