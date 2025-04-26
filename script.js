let mediaRecorder;
let recordedChunks = [];
let isRecording = false;

const mixBtn = document.getElementById('mixBtn');
const preview = document.getElementById('preview');

mixBtn.addEventListener('click', async () => {
  if (!isRecording) {
    // Start recording
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    preview.srcObject = stream;
    preview.play();

    recordedChunks = [];

    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);

      // Create and append recorded video
      const videoElement = document.createElement('video');
      videoElement.controls = true;
      videoElement.src = videoURL;
      document.body.appendChild(videoElement);
      videoElement.play();

      // Create and append download button
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download Video';
      document.body.appendChild(downloadBtn);

      downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href = videoURL;
        a.download = 'dicecut-recording.webm';
        a.click();
        URL.revokeObjectURL(videoURL);
      });
    };

    mediaRecorder.start();
    isRecording = true;
    mixBtn.textContent = '🛑 Stop Mixing';
  } else {
    // Stop recording
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    isRecording = false;
    mixBtn.textContent = '🎲 Tap to Mix!';
  }
});
