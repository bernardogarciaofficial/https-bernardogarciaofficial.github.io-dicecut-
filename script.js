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
document.addEventListener('DOMContentLoaded', const diceUI = document.getElementById('dice-ui');

diceUI.addEventListener('click', () => {
  const videoTracks = document.querySelectorAll('.video-track video');

  if (videoTracks.length < 10) {
    console.warn('Not all video tracks are loaded yet.');
    return;
  }

  console.log('🎲 Shuffling 8-bar segments...');

  const barLength = 4; // seconds
  const barsPerSegment = 8;
  const totalSegments = 5;

  let shuffledSequence = [];

  for (let i = 0; i < totalSegments; i++) {
    const randomTrackIndex = Math.floor(Math.random() * videoTracks.length);
    const startTime = i * barLength * barsPerSegment;

    shuffledSequence.push({
      track: randomTrackIndex,
      start: startTime,
      duration: barLength * barsPerSegment
    });
  }

  console.log('🧪 Shuffle Result:', shuffledSequence);

  videoTracks.forEach((video) => {
    video.style.border = '2px solid transparent';
  });

  shuffledSequence.forEach(item => {
    const vid = videoTracks[item.track];
    if (vid) {
      vid.style.border = '3px solid #00cc66';
    }
  });
});
() => {
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

