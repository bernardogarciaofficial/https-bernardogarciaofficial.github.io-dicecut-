// JavaScript for handling the Master Music Track playback
document.getElementById('master-track-upload').addEventListener('change', function(event) {
  const audioPlayer = document.getElementById('master-track');
  const audioSource = document.getElementById('audio-source');
  
  // Check if a file was uploaded
  const file = event.target.files[0];
  if (file) {
    const objectURL = URL.createObjectURL(file);
    audioSource.src = objectURL; // Set the source of the audio
    audioPlayer.load(); // Reload the audio element with the new source
    audioPlayer.play(); // Automatically start playing the audio
  }
});

// JavaScript for handling video track selection
const videoTracksContainer = document.getElementById('video-tracks-container');

// Create 10 video tracks dynamically
for (let i = 1; i <= 10; i++) {
  const videoTrackDiv = document.createElement('div');
  videoTrackDiv.classList.add('video-track');
  videoTrackDiv.id = 'video-track-' + i;

  // Create video element
  const videoElement = document.createElement('video');
  videoElement.setAttribute('autoplay', 'true');
  videoElement.setAttribute('muted', 'true');
  
  // Create the Select button
  const selectButton = document.createElement('button');
  selectButton.classList.add('select-btn');
  selectButton.textContent = '🎯 Select to Record';
  selectButton.addEventListener('click', function() {
    // Toggle the video track as selected
    videoTrackDiv.classList.toggle('selected');
  });

  // Append video element and select button to the video track container
  videoTrackDiv.appendChild(videoElement);
  videoTrackDiv.appendChild(selectButton);
  
  // Append the video track to the main container
  videoTracksContainer.appendChild(videoTrackDiv);
}
