
 let mediaRecorder;
let recordedChunks = [];

recordBtn.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    recordBtn.textContent = "🎥 Record";
    indicator.classList.remove("blinking");
  } else {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      preview.srcObject = stream;
      preview.muted = true;
      preview.play();

      recordedChunks = [];

      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        preview.srcObject = null;
        preview.src = url;
        preview.controls = true;
        preview.play();
      };

      mediaRecorder.start();
      recordBtn.textContent = "⏹ Stop";
      indicator.classList.add("blinking");

    } catch (error) {
      alert("Camera access denied or unavailable. Please check your camera settings.");
    }
  }
});
