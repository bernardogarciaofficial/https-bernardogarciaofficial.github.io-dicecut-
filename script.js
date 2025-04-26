
// Grab elements from the DOM
const videoTracksContainer = document.getElementById('video-tracks-container');
const masterUpload = document.getElementById('master-track-upload');
const rollDiceBtn = document.getElementById('roll-dice-btn');
const mixBtn = document.getElementById('mix-btn');
const masterTrack = document.getElementById('master-track');

// Handle master track upload
masterUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    masterTrack.src = URL.createObjectURL(file);
    masterTrack.load();
  }
});

// Create video track blocks dynamically (All video tracks will be stacked vertically)
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

  // Handle video recording
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
          if (event.data.size > 0) recordedChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
          if (recordedChunks.length > 0) {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoURL = URL.createObjectURL(blob);
            preview.srcObject = null;
            preview.src = videoURL;
            preview.controls = true;
            preview.play();
          }

          if (stream) stream.getTracks().forEach(track => track.stop());
          indicator.classList.remove('blinking');
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

  // Handle video upload
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

  // Handle video delete
  deleteBtn.addEventListener('click', () => {
    preview.src = '';
    preview.srcObject = null;
    preview.pause();
  });
}

// Mix videos function (Roll the Dice logic)
rollDiceBtn.addEventListener('click', () => {
  console.log('Rolling the dice...');
  const videoTracks = document.querySelectorAll('.video-track video');
  const selectedVideos = [];

  videoTracks.forEach((video) => {
    if (video.src && Math.random() > 0.5) {
      selectedVideos.push(video);
    }
  });

  if (selectedVideos.length === 0) {
    alert('No video tracks available for mixing.');
    return;
  }

  const mixedVideo = document.createElement('video');
  mixedVideo.controls = true;
  mixedVideo.width = 640;

  // Combine video elements (simple simulation of mixing)
  mixedVideo.src = selectedVideos.map(v => v.src).join('&');
  document.body.appendChild(mixedVideo);
  mixedVideo.play();
});

// Mix button for triggering mix functionality
mixBtn.addEventListener('click', () => {
  console.log('Mixing videos...');
  // Future enhancement: Improve logic for actual mixing of videos with audio sync
});
