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
  selectButton.textContent = `🎯 Select to Record ${i}`;
  selectButton.addEventListener('click', function() {
    videoTrackDiv.classList.toggle('selected');
  });

  videoTrackDiv.appendChild(videoElement);
  videoTrackDiv.appendChild(selectButton);
  
  videoTracksContainer.appendChild(videoTrackDiv);
}

// Dice roll functionality to randomize selected tracks
const rollDiceButton = document.getElementById('roll-dice-btn');
rollDiceButton.addEventListener('click', function() {
  const videoTracks = document.querySelectorAll('.video-track');
  videoTracks.forEach(track => track.classList.remove('selected')); // Deselect all tracks
  
  // Randomly select 3 tracks
  const randomIndexes = new Set();
  while (randomIndexes.size < 3) {
    const randomIndex = Math.floor(Math.random() * videoTracks.length);
    randomIndexes.add(randomIndex);
  }

  randomIndexes.forEach(index => {
    videoTracks[index].classList.add('selected');
  });

  alert('🎲 Dice rolled! Random tracks selected.');
});

// Light/Dark mode toggle
const toggleThemeButton = document.getElementById('toggle-theme');
toggleThemeButton.addEventListener('click', function() {
  document.body.classList.toggle('light-mode'); // Toggles the light-mode class on the body
  if (document.body.classList.contains('light-mode')) {
    toggleThemeButton.textContent = '🌙 Switch to Dark Mode';
  } else {
    toggleThemeButton.textContent = '☀️ Switch to Light Mode';
  }
});
