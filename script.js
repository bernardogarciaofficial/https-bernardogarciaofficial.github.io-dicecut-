let mediaRecorder;
let recordedChunks = [];

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

startBtn.addEventListener('click', async () => {
  // Get user media (video only or video + audio)
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

  // Preview the video (optional)
  const preview = document.getElementById('preview');
  preview.srcObject = stream;
  preview.play();

  recordedChunks = []; // Reset previous recordings

  // Set up MediaRecorder
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const videoURL = URL.createObjectURL(blob);

    // Create and append the video element
    const videoElement = document.createElement('video');
    videoElement.controls = true;
    videoElement.src = videoURL;
    document.body.appendChild(videoElement);
    videoElement.play();

    // Create and append the download button
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download Video';
    document.body.appendChild(downloadBtn);

    downloadBtn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = videoURL;
      a.download = 'recorded-video.webm';
      a.click();
      URL.revokeObjectURL(videoURL); // Clean up
    });
  };

  mediaRecorder.start();
});

stopBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
});
