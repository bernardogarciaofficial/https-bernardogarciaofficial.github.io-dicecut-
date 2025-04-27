let selectedTrackIndex = null;
let mediaRecorder;
let recordedChunks = [];
let stream = null;

const masterAudio = document.getElementById('master-track');
const recordBtn = document.getElementById('record-btn');
const indicator = document.getElementById('indicator');
const preview = document.getElementById('preview');
const videoTracksContainer = document.getElementById('video-tracks-container');

// Generate 10 video tracks
for (let i = 0; i < 10; i++) {
  const track = document.createElement('div');
  track.classList.add('video-track');
  track.id = `track-${i}`;

  const title = document.createElement('h3');
  title.textContent = `Video Track ${i + 1}`;

  const selectBtn = document.createElement('button');
  selectBtn.textContent = '🎯 Select to Record';
  selectBtn.classList.add('select-btn');

  selectBtn.addEventListener('click', () => {
    // Deselect all
    document.querySelectorAll('.video-track').forEach(t => t.classList.remove('selected'));
    document.querySelectorAll('.select-btn').forEach(b => b.classList.remove('selected'));

    // Select this one
    track.classList.add('selected');
    selectBtn.classList.add('selected');
    selectedTrackIndex = i;
  });

  track.appendChild(title);
  track.appendChild(selectBtn);
  videoTracksContainer.appendChild(track);
}

// 🎥 Record Button Handler
recordBtn.addEventListener('click', async () => {
  if (selectedTrackIndex === null) {
    alert('Please select a video track to record into.');
    return;
  }

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = '🎥 Record';
    indicator.classList.remove('blinking');
    preview.style.display = 'none';
    masterAudio.pause();
  } else {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      preview.srcObject = stream;
      preview.style.display = 'block';

      recordedChunks = [];
      mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);

        const video = document.createElement('video');
        video.src = url;
        video.controls = true;
        video.style.marginTop = '10px';
        video.style.width = '100%';
        video.style.borderRadius = '10px';

        const track = document.getElementById(`track-${selectedTrackIndex}`);
        track.appendChild(video);

        preview.srcObject = null;
        preview.style.display = 'none';

        if (stream) stream.getTracks().forEach(track => track.stop());
        indicator.classList.remove('blinking');
      };

      mediaRecorder.start();
      masterAudio.currentTime = 0;
      masterAudio.play();
      recordBtn.textContent = '⏹ Stop';
      indicator.classList.add('blinking');
    } catch (err) {
      console.error(err);
      alert('Failed to access camera/mic.');
    }
  }
});
