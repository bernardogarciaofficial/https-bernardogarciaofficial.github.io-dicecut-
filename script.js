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

    const recordBtn = trackDiv.querySelector('.record-btn');
    const uploadBtn = trackDiv.querySelector('.upload-btn');
    const deleteBtn = trackDiv.querySelector('.delete-btn');
    const videoElement = trackDiv.querySelector('.preview');
    const recordingIndicator = trackDiv.querySelector('.recording-indicator');
    let mediaRecorder;
    let recordedChunks = [];
    let stream;

    // Handle recording
    recordBtn.addEventListener('click', async () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            // Stop recording
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
            recordingIndicator.classList.remove('recording');
        } else {
            // Start recording
            stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            videoElement.srcObject = stream;
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (event) => {
                recordedChunks.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const blob = new Blob(recordedChunks, { type: 'video/webm' });
                const videoURL = URL.createObjectURL(blob);
                videoElement.src = videoURL;  // Set the video element to the recorded video
            };
            mediaRecorder.start();
            recordingIndicator.classList.add('recording');
        }
    });

    // Handle upload
    uploadBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const videoURL = URL.createObjectURL(file);
            videoElement.src = videoURL;  // Show the uploaded video in the preview
        };
        input.click();  // Trigger the file input click event
    });

    // Handle delete
    deleteBtn.addEventListener('click', () => {
        videoElement.src = '';  // Remove the video preview
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop());
        }
        recordedChunks = [];  // Clear recorded chunks
        recordingIndicator.classList.remove('recording');
    });
}
