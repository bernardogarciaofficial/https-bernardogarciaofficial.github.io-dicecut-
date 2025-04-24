// 🎲 Dice Rolling Logic
function rollDice() {
  const videos = document.querySelectorAll('.preview');

  if (videos.length < 10) {
    alert("Make sure all 10 videos are loaded first!");
    return;
  }

  const segmentDuration = 8 * 2; // 8 bars at 2s each
  const numSegments = 4;
  const sequence = [];

  for (let i = 0; i < numSegments; i++) {
    const trackIndex = Math.floor(Math.random() * videos.length);
    const startTime = i * segmentDuration;
    sequence.push({ trackIndex, startTime });
  }

  videos.forEach(video => {
    video.pause();
    video.style.borderColor = 'transparent';
  });

  sequence.forEach(item => {
    const vid = videos[item.trackIndex];
    if (vid) {
      vid.currentTime = item.startTime;
      vid.play();
      vid.classList.add('playing');
      setTimeout(() => vid.classList.remove('playing'), segmentDuration * 1000);
    }
  });
}

// 🎚️ Theme Toggle
document.getElementById('themeSwitch').addEventListener('change', (e) => {
  document.documentElement.setAttribute('data-theme', e.target.checked ? 'light' : 'dark');
});

// 🎲 Dice UI Click
document.getElementById('dice-ui').addEventListener('click', rollDice);

// 🎥 Recording Logic
document.querySelectorAll('.video-track').forEach(track => {
  const recordBtn = track.querySelector('.record-btn');
  const preview = track.querySelector('.preview');
  const spinner = track.querySelector('.spinner');

  let mediaRecorder;
  let recordedChunks = [];

  recordBtn.addEventListener('click', async () => {
    spinner.classList.remove('hidden');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    preview.srcObject = stream;

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.start();
    recordedChunks = [];

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const videoURL = URL.createObjectURL(blob);
      preview.srcObject = null;
      preview.src = videoURL;
      preview.controls = true;
      spinner.classList.add('hidden');
    };

    setTimeout(() => {
      mediaRecorder.stop();
      stream.getTracks().forEach(t => t.stop());
    }, 15000);
  });
});

// 📂 Drag & Drop Upload for Music
const musicZone = document.getElementById('music-upload');
const audioInput = document.getElementById('audioInput');

musicZone.addEventListener('click', () => audioInput.click());
musicZone.addEventListener('dragover', (
