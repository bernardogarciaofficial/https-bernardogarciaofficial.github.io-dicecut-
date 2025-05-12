// Handle audio upload and playback
document.getElementById('master-track-upload').addEventListener('change', function(event) {
  const audioPlayer = document.getElementById('master-track');
  const audioSource = document.getElementById('audio-source');
  
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    audioSource.src = objectURL;
    audioPlayer.load();
    audioPlayer.play();
  }
});

// Generate 10 slave video tracks dynamically
const videoTracksContainer = document.getElementById('video-tracks-container');

for (let i = 1; i <= 10; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.classList.add('video-track');
  videoTrackDiv.id = 'video-track-' + i;

  const videoElement = document.createElement('video');
  videoElement.setAttribute('autoplay', 'true');
  videoElement.setAttribute('muted', 'true');
  videoElement.setAttribute('controls', '');

  const selectButton = document.createElement('button');
  selectButton.classList.add('select-btn');
  selectButton.textContent = `Select Track ${i}`;
  selectButton.addEventListener('click', function() {
    videoTrackDiv.classList.toggle('selected');
  });

  videoTrackDiv.appendChild(videoElement);
  videoTrackDiv.appendChild(selectButton);
  
  videoTracksContainer.appendChild(videoTrackDiv);
}

// Handle recording functionality
const recordBtn = document.getElementById('record-btn');
let isRecording = false;

recordBtn.addEventListener('click', function() {
  if (!isRecording) {
    // Start recording logic
    recordBtn.textContent = '🛑 Stop Recording';
    isRecording = true;
    alert('Recording started!');
  } else {
    // Stop recording logic
    recordBtn.textContent = '🎙️ Start Recording';
    isRecording = false;
    alert('Recording stopped!');
  }
});
