document.addEventListener('DOMContentLoaded', () => {
  const videoTracks = document.querySelectorAll('.video-track');
  const musicDeleteBtn = document.getElementById('music-delete-btn');
  const musicInput = document.getElementById('music-upload-input');

  // Show the delete button when a music file is uploaded
  musicInput.addEventListener('change', () => {
    if (musicInput.files.length > 0) {
      musicDeleteBtn.style.display = 'inline-block'; // Show delete button
    }
  });

  // Music delete button functionality
  musicDeleteBtn.addEventListener('click', () => {
    musicInput.value = ''; // Clear music input
    musicDeleteBtn.style.display = 'none'; // Hide delete button
    alert('Music track deleted!');
  });

  // Delete video track functionality
  videoTracks.forEach((track, index) => {
    const deleteBtn = track.querySelector('.delete-btn');
    const preview = track.querySelector('.preview');

    deleteBtn.addEventListener('click', () => {
      if (preview.src) {
        URL.revokeObjectURL(preview.src); // Clean up the object URL
      }
      track.remove(); // Remove the video track from the DOM
      alert(`Video Track ${index + 1} deleted!`);
    });
  });
});

function rollDice() {
  const videoTracks = document.querySelectorAll('.video-track video');
  if (videoTracks.length < 10) {
    alert('Make sure all 10 videos are loaded first!');
    return;
  }

  console.log('🎲 Shuffling 8-bar segments...');

  // Add your dice roll logic here
}
