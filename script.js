document.addEventListener('DOMContentLoaded', () => {
  // Toggle Light/Dark Mode
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', themeToggle.checked);
  });

  // Handle video track recording logic
  document.querySelectorAll('.video-track').forEach((track, index) => {
    const recordBtn = track.querySelector('.record-btn');
    const preview = track.querySelector('.preview');
    const spinner = track.querySelector('.spinner');
    let mediaRecorder;
    let recordedChunks = [];

    recordBtn.addEventListener('click', async () => {
      spinner.style.display = 'inline-block'; // Show spinner while recording
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
        spinner.style.display = 'none'; // Hide spinner after recording
      };

      // Auto-stop after 15 seconds (optional for testing)
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      }, 15000);
    });
  });

  // Handle file upload for video tracks
  document.querySelectorAll('.video-track .upload-btn').forEach((uploadBtn, index) => {
    const preview = uploadBtn.closest('.video-track').querySelector('.preview');
    uploadBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';

      input.addEventListener('change', () => {
        const file = input.files[0];
        const url = URL.createObjectURL(file);
        preview.src = url;
        preview.controls = true;
      });

      input.click();
    });
  });

  // Handle Dice Roll Logic
  const rollDiceButton = document.querySelector('.dice-button');
  rollDiceButton.addEventListener('click', () => {
    const videos = document.querySelectorAll('.video-track video');

    if (videos.length < 10) {
      alert("Make sure all 10 videos are loaded first!");
      return;
    }

    console.log('🎲 Shuffling 8-bar segments...');

    const segmentDuration = 8 * 2; // 8 bars at 2s per bar (adjust if needed)
    const numSegments = 4; // How many segments in your remix

    const sequence = [];

    for (let i = 0; i < numSegments; i++) {
      const trackIndex = Math.floor(Math.random() * videos.length);
      const startTime = i * segmentDuration;

      sequence.push({ trackIndex, startTime });
    }

    console.log('🧪 Remix sequence:', sequence);

    // Reset all borders
    videos.forEach(video => video.style.border = '2px solid transparent');

    // Highlight selected videos
    sequence.forEach(item => {
      const vid = videos[item.trackIndex];
      if (vid) {
        vid.currentTime = item.startTime;
        vid.play();
        vid.style.border =
