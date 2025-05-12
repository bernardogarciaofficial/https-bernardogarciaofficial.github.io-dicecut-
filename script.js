
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

// Generate video tracks dynamically
const videoTracksContainer = document.getElementById('video-tracks-container');

for (let i = 1; i <= 10; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.classList.add('video-track');
  videoTrackDiv.id = 'video-track-' + i;

  const videoElement = document.createElement('video');
  videoElement.setAttribute('autoplay', 'true');
  videoElement.setAttribute('muted', 'true');
  
  const selectButton = document.createElement('button');
  selectButton.classList.add('select-btn');
  selectButton.textContent = `🎯 Select Track ${i}`;
  selectButton.addEventListener('click', function() {
    videoTrackDiv.classList.toggle('selected');
  });

  videoTrackDiv.appendChild(videoElement);
  videoTrackDiv.appendChild(selectButton);
  
  videoTracksContainer.appendChild(videoTrackDiv);
}

// Handle recording (only triggered by the Rec button in the master track)
const recButton = document.getElementById('rec-btn');
recButton.addEventListener('click', () => {
  alert('Recording started! This feature will sync with the master track and selected video tracks.');
});
