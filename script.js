let selectedTrackIndex = null;
let mediaRecorder;
let recordedChunks = [];
let stream = null;

const recordBtn = document.getElementById('record-btn');
const videoTracksContainer = document.getElementById('video-tracks-container');

// Generate 10 video tracks dynamically
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
    document.querySelectorAll('.video-track').forEach(t => t.classList.remove('selected'));
    selectBtn.classList.add('selected');
    selectedTrackIndex = i;
  });

  track.appendChild(title);
  track.appendChild(selectBtn);
  videoTracksContainer.appendChild(track);
}

// Handle recording functionality
recordBtn.addEventListener('click', async () => {
  if (selectedTrackIndex === null) {
    alert('Please select a video track to record into.');
    return;
  }

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const preview = document.getElementById('preview');
    preview.srcObject = stream;
    preview.style.display = 'block';

    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => {
      recordedChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);

      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.style.marginTop = '10px';

      const track = document.getElementById(`track-${selectedTrackIndex}`);
      track.appendChild(video); // Append the recorded video to the selected track

      const a = document.createElement('a');
      a.href = url;
      a.download = `recording-${new Date().toISOString()}.webm`;
      a.click();

      stream.getTracks().forEach(track => track.stop()); // Stop the stream
    };

    mediaRecorder.start();
    recordBtn.textContent = '⏹ Stop';
  } catch (err) {
    console.error(err);
    alert('Failed to access camera/mic.');
  }
});
