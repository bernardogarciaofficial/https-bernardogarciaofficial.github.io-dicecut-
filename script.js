document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  themeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode', themeToggle.checked);
  });

  // Roll Dice Functionality
  const diceButton = document.getElementById('dice-button');
  diceButton.addEventListener('click', () => {
    const videos = document.querySelectorAll('.video-track video');
    if (videos.length < 10) {
      alert("Make sure all 10 videos are loaded first!");
      return;
    }

    // Shuffle and play videos
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
        vid.style.border = '3px solid #00cc66';
      }
    });
  });

  // Video recording logic
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
