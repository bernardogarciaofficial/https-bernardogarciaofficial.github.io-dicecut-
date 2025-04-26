// Grab the elements
const rollDiceBtn = document.getElementById('roll-dice-btn');
const videoTracks = document.querySelectorAll('.video-track video');
const masterTrack = document.getElementById('master-track');

// Function to "mix" the videos
function mixVideos() {
  const selectedVideos = [];

  // Randomly select up to 5 videos with content
  videoTracks.forEach((video, index) => {
    if (video.src) {
      // Randomly decide whether to include this video in the mix (50% chance)
      if (Math.random() > 0.5) {
        selectedVideos.push(video);
      }
    }
  });

  // If no videos were selected, stop here
  if (selectedVideos.length === 0) {
    alert("No video tracks available for mixing.");
    return;
  }

  // Create a new video element to preview the mix
  const mixedVideo = document.createElement('video');
  mixedVideo.controls = true;
  mixedVideo.width = 640;

  // Combine the video elements into a new mixed video
  let mixUrl = selectedVideos.map(v => v.src).join('&'); // Simulate combining

  // Set the mixed video source (for now just play the selected videos in sequence)
  mixedVideo.src = mixUrl;
  document.body.appendChild(mixedVideo); // Add the mixed video to the DOM
  
  // Play the master track in sync with the videos
  if (masterTrack) {
    masterTrack.play();
  }

  mixedVideo.play(); // Play the mixed video
  console.log("Mixed video playing...");
}

// Roll Dice - Button Click Handler
rollDiceBtn.addEventListener('click', () => {
  console.log("Rolling the dice...");
  mixVideos();
});
