const recordBtns = document.querySelectorAll('.record-btn');
const videoPreviews = document.querySelectorAll('video');
const recordingIndicators = document.querySelectorAll('.recording-indicator');

recordBtns.forEach((btn, index) => {
  let mediaRecorder;
  let stream;
  let isRecording = false;
  let chunks = [];

  btn.addEventListener('click', async () => {
    const videoTrack = videoPreviews[index];
    const recordingIndicator = recordingIndicators[index];

    if (isRecording) {
      mediaRecorder.stop();
      btn.textContent = '🎥 Record';
      recordingIndicator.style.display = 'none';
      isRecording = false;
    } else {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoTrack.srcObject = stream;

        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          videoTrack.srcObject = null;
          videoTrack.src = videoURL;
          chunks = [];
        };

        mediaRecorder.start();
        btn.textContent = '⏺ Stop Recording';
        recordingIndicator.style.display = 'block';
        isRecording = true;
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Camera access denied or unavailable. Please check your camera settings.');
      }
    }
  });
});

const themeToggleBtn = document.querySelector('.theme-toggle-btn');
themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});
