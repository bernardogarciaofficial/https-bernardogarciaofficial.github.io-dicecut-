// Get elements
const masterTrackUpload = document.getElementById('master-track-upload');
const masterTrack = document.getElementById('master-track');
const preview = document.getElementById('preview');
const videoTracks = document.querySelectorAll('.video-track video');

// Handle audio file upload and play
masterTrackUpload.addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (file) {
    const audioURL = URL.createObjectURL(file);
    masterTrack.src = audioURL;
    masterTrack.play();
  }
});

// Select video track function
function selectTrack(trackNumber) {
  const selectedTrack = document.getElementById(`video-${trackNumber}`);
  selectedTrack.classList.toggle('selected');
  alert(`Video Track ${trackNumber} Selected`);
}

// Record button functionality (Placeholder for actual functionality)
document.getElementById('record-btn').addEventListener('click', () => {
  alert('Recording functionality is not yet implemented');
});

// Theme toggle functionality (Light/Dark Mode)
document.getElementById('toggle-theme').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Roll the dice functionality (Placeholder for actual functionality)
document.getElementById('roll-dice-btn').addEventListener('click', () => {
  alert('Rolling the dice...');
});

// Mix button functionality (Placeholder for actual functionality)
document.getElementById('mix-btn').addEventListener('click', () => {
  alert('Mixing...');
});
