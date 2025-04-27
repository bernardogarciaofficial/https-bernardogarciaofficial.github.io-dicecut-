const recordBtn = document.getElementById('record-btn');
const indicator = document.getElementById('indicator');
const preview = document.getElementById('preview');
const masterAudio = document.getElementById('master-track');

const videoTracksContainer = document.getElementById('video-tracks-container');
let mediaRecorder;
let recordedChunks = [];
let stream;
let selectedTrackIndex = null;
const MAX_TRACKS = 10;

// Create 10 video track slots
for (let i = 0; i < MAX_TRACKS; i++) {
  const trackDiv = document.createElement('div');
  trackDiv.className = 'video-track';
  trackDiv.id = `track-${i}`;

  const label = document.createElement('h3');
  label.textContent = `Video Track ${i + 1}`;

  const selectBtn = document.createElement('button');
  selectBtn.className = 'select-btn';
  selectBtn.textContent = '🎬 Select to Record';

  selectBtn.addEventListener('click', () => {
    document.querySelectorAll('.video-track').forEach((el, idx) => {
      el.classList.remove('selected');
      el.querySelector('button').classList.remove('selected');
    });
    trackDiv.classList.add('selected');
    selectBtn.classList.add('selected');
    selectedTrackIndex = i;
  });

  trackDiv.appendChild(label);
  trackDiv.appendChild(selectBtn);
  videoTracksContainer.appendChild(trackDiv);
}

recordBtn.addEventListener('click', async () => {
  if (selectedTrackIndex === null) {
    alert('Please select a video track to record into.');
    return;
  }

  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    recordBtn.textContent = '🎥 Record';
    indicator.classList.remove('blinking');
    masterAudio.pause();
  } else {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      preview.srcObject = stream;
      preview.muted = true;

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

        const track = document.getElementById(`track-${selectedTrackIndex}`);
        track.appendChild(video);

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
