function rollDice() {
  alert("Dice rolled! Random edit in progress...");
}// Get all Record buttons
const recordButtons = document.querySelectorAll('.record-btn');
recordButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    console.log(`🎙️ Record button clicked on track ${index + 1}`);
  });
});

// Get all Upload buttons
const uploadButtons = document.querySelectorAll('.upload-btn');
uploadButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    console.log(`📁 Upload button clicked on track ${index + 1}`);
  });
});
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.video-track').forEach((track, index) => {
    const recordBtn = track.querySelector('.record-btn');
    const preview = track.querySelector('.preview');
    let mediaRecorder;
    let recordedChunks = [];

    recordBtn.addEventListener('click', async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      preview.srcObject = stream;

      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      recordedChunks = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const videoURL = URL.createObjectURL(recordedBlob);
        preview.srcObject = null;
        preview.src = videoURL;
        preview.controls = true;
      };

      // Auto-stop after 15 seconds (optional for testing)
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 15000);
    });
  });
});

