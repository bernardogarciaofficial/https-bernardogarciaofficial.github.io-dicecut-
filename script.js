document.addEventListener('DOMContentLoaded', () => {
  const videoTracksContainer = document.getElementById('video-tracks');

  // Create 10 video tracks
  for (let i = 1; i <= 10; i++) {
    const track = document.createElement('div');
    track.classList.add('video-track');
    track.innerHTML = `
      <h3>Video Track ${i}</h3>
      <button class="record-btn">🎥 Record</button>
      <button class="upload-btn">📁 Upload</button>
      <button class="delete-btn">❌ Delete</button>
      <video class="preview" controls></video>
      <div class="spinner" style="display: none;"></div>
    `;
    videoTracksContainer.appendChild(track);

    const recordBtn = track.querySelector('.record-btn');
    const uploadBtn = track.querySelector('.upload-btn');
    const deleteBtn = track.querySelector('.delete-btn');
    const preview = track.querySelector('.preview');
    const spinner = track.querySelector('.spinner');

    // 🎥 RECORD BUTTON
    recordBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        preview.srcObject = stream;
        preview.autoplay = true;
        preview.muted = true;
        preview.playsInline = true;
        preview.style.display = 'block';

        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        mediaRecorder.ondataavailable = e => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          preview.srcObject = null;
          preview.src = videoURL;
          preview.controls = true;

          stream.getTracks().forEach(track => track.stop());
          spinner.style.display = 'none';
        };

        mediaRecorder.start();
        spinner.style.display = 'block';

        setTimeout(() => {
          mediaRecorder.stop();
        }, 15000);
      } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Camera access denied or unavailable.');
      }
    });

    // 📁 UPLOAD BUTTON
    uploadBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'video/*';
      input.onchange = () => {
        const file = input.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          preview.src = url;
          preview.controls = true;
        }
      };
      input.click();
    });

    // ❌ DELETE BUTTON
    deleteBtn.addEventListener('click', () => {
      preview.src = '';
      preview.removeAttribute('src');
      preview.load();
    });
  }

  // 🎲 ROLL THE DICE - SHUFFLE VIDEOS
  const rollDiceBtn = document.getElementById('roll-dice-btn');
  const mixBtn = document.getElementById('mix-btn');

  function shuffleVideos() {
    const videos = document.querySelectorAll('.video-track video');
    const activeVideos = Array.from(videos).filter(video => video.src);

    if (activeVideos.length < 1) {
      alert("Please upload or record videos first!");
      return;
    }

    const barLength = 4;
    const barsPerSegment = 8;
    const totalSegments = 5;

    const shuffled = [];

    for (let i = 0; i < totalSegments; i++) {
      const randomVideo = activeVideos[Math.floor(Math.random() * activeVideos.length)];
      randomVideo.currentTime = i * barLength * barsPerSegment;
      randomVideo.play();
      shuffled.push(randomVideo);
    }

    console.log("🎲 Playing remix with", shuffled.length, "segments.");
  }

  rollDiceBtn.addEventListener('click', shuffleVideos);
  mixBtn.addEventListener('click', shuffleVideos);

  // 🌗 LIGHT/DARK MODE
  const themeToggle = document.getElementById('theme-toggle-checkbox');
  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode', themeToggle.checked);
  });
});

