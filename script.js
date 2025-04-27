const videoTracksContainer = document.getElementById('video-tracks-container');
const masterUpload = document.getElementById('master-track-upload');
const masterTrack = document.getElementById('master-track');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const mixBtn = document.getElementById('mix-btn');

// Load master audio track
masterUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    masterTrack.src = URL.createObjectURL(file);
    masterTrack.load();
  }
});

// Create 10 stacked video tracks
for (let i = 1; i <= 10; i++) {
  const trackDiv = document.createElement('div');
  trackDiv.className = 'video-track';

  trackDiv.innerHTML = `
    <h3>Video Track ${i}</h3>
    <button class="record-btn">🎥 Record</button>
    <button class="upload-btn">📁 Upload</button>
    <button class="delete-btn">❌ Delete</button>
    <video class="preview" controls></video>
    <div class="recording-indicator"></div>
  `;

  videoTracksContainer.appendChild(trackDiv);

  const recordBtn = trackDiv.querySelector('.record-btn');
  const uploadBtn = trackDiv.querySelector('.upload-btn');
  const deleteBtn = trackDiv.querySelector('.delete-btn');
  const preview = trackDiv.querySelector('.preview');
  const indicator = trackDiv.querySelector('.recording-indicator');

  let mediaRecorder;
  let stream;
  let recordedChunks = [];

  // 🎥 Record / Stop logic
  recordBtn.addEventListener('click', async () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      recordBtn.textContent = '🎥 Record';
      indicator.classList.remove('blinking');
    } else {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        preview.srcObject = stream;
        preview.muted = true;
        preview.play();

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunks, { type: 'video/webm' });
          const videoURL = URL.createObjectURL(blob);
          preview.srcObject = null;
          preview.src = videoURL;
          preview.controls = true;
          preview.play();

          if (stream) stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        recordBtn.textContent = '⏹ Stop';
        indicator.classList.add('blinking');
      } catch (err) {
        alert('Camera access denied or unavailable.');
        console.error(err);
      }
    }
  });

  // 📁 Upload video from file
  uploadBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';

    input.onchange = () => {
      const file = input.files[0];
      if (file) {
        const videoURL = URL.createObjectURL(file);
        preview.src = videoURL;
        preview.controls = true;
        preview.play();
      }
    };

    input.click();
  });

  // ❌ Delete video from preview
  deleteBtn.addEventListener('click', () => {
    preview.src = '';
    preview.srcObject = null;
    preview.pause();
  });
}

// 🎲 Dice Logic (placeholder for now)
rollDiceBtn.addEventListener('click', () => {
  console.log("Rolling the dice...");
  // You could highlight or shuffle videos here
});

// 🌀 Mix button (placeholder)
mixBtn.addEventListener('click', () => {
  alert('Mixing feature coming soon...');
});
