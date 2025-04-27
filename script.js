const masterAudio = document.getElementById('master-track');
const recordBtn = document.getElementById('record-btn');
const preview = document.getElementById('preview');
const indicator = document.getElementById('indicator');

let stream = null;
let mediaRecorder = null;
let recordedChunks = [];
let selectedTrackIndex = null;

// Handle selecting a video track
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('select-btn')) {
    const allTracks = document.querySelectorAll('.video-track');
    allTracks.forEach((track, index) => {
      if (track.contains(e.target)) {
        selectedTrackIndex = index;
        track.classList.add('selected');
        e.target.classList.add('selected');
      } else {
        track.classList.remove('selected');
        track.querySelector('.select-btn').classList.remove('selected');
      }
    });
  }
});

// Start/Stop recording
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
      indicator.classList.add('blinking'); // ⬅️ Start blinking indicator
      masterAudio.currentTime = 0;
      masterAudio.play();
      recordBtn.textContent = '⏹ Stop';

    } catch (err) {
      console.error(err);
      alert('Failed to access camera/mic.');
    }
  }
});
