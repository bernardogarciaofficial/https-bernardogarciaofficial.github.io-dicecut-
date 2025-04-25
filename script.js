// Function to handle starting the recording
function startRecording(videoTrackId) {
    const videoElement = document.querySelector(`#video-track-${videoTrackId} video.preview`);
    const recordButton = document.querySelector(`#video-track-${videoTrackId} .record-btn`);
    const spinner = document.querySelector(`#video-track-${videoTrackId} .spinner`);
    const mediaConstraints = {
        video: true,
        audio: true
    };
    
    // Start loading spinner
    spinner.style.display = 'inline-block';

    // Access the camera and microphone
    navigator.mediaDevices.getUserMedia(mediaConstraints)
        .then((stream) => {
            // Show the video preview
            videoElement.srcObject = stream;
            videoElement.play();
            
            // Disable the record button while recording
            recordButton.disabled = true;

            const mediaRecorder = new MediaRecorder(stream);
            const recordedChunks = [];

            // When data is available, push it to the recordedChunks array
            mediaRecorder.ondataavailable = (event) => {
                recordedChunks.push(event.data);
            };

            // When recording is stopped, we can save the video
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoURL = URL.createObjectURL(blob);
                videoElement.srcObject = null;
                videoElement.src = videoURL;
                videoElement.controls = true;
                spinner.style.display = 'none';
            };

            // Start recording
            mediaRecorder.start();

            // Return the mediaRecorder and stream for later use
            return { mediaRecorder, stream, recordButton };
        })
        .catch((err) => {
            console.error("Error accessing the camera: ", err);
            spinner.style.display = 'none';
        });
}

// Add event listeners to each record button
document.querySelectorAll('.record-btn').forEach((button, index) => {
    button.addEventListener('click', () => {
        startRecording(index + 1);
    });
});
