const recordBtns = document.querySelectorAll('.record-btn');
const videoPreviews = document.querySelectorAll('video');
const recordingIndicators = document.querySelectorAll('.recording-indicator');
const deleteBtns = document.querySelectorAll('.delete-btn');
const uploadBtns = document.querySelectorAll('.upload-btn');

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
          videoTrack.style.display = 'block'; // Ensure the video is visible
          deleteBtns[index].style.display = 'inline-block'; // Show delete button
          uploadBtns[index].style.display = 'inline-block'; // Show upload button
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

  deleteBtns[index].addEventListener('click', () => {
    videoTrack.src = '';
    videoTrack.style.display = 'none';
    deleteBtns[index].style.display = 'none';
    uploadBtns[index].style.display = 'none';
  });

  uploadBtns[index].addEventListener('click', () => {
    const videoTrack = videoPreviews[index];
    const videoURL = videoTrack.src;
    const a = document.createElement('a');
    a.href = videoURL;
    a.download = `video_track_${index + 1}.webm`;
    a.click();
  });
});
