const videoTracksContainer = document.getElementById('video-tracks-container');
 const masterUpload = document.getElementById('master-track-upload');
 // Grab the elements
 const rollDiceBtn = document.getElementById('roll-dice-btn');
 const videoTracks = document.querySelectorAll('.video-track video');
 const masterTrack = document.getElementById('master-track');
 
 masterUpload.addEventListener('change', (e) => {
   const file = e.target.files[0];
   if (file) {
     masterTrack.src = URL.createObjectURL(file);
     masterTrack.load();
   }
 });
 
 for (let i = 1; i <= 10; i++) {
   const trackDiv = document.createElement('div');
   trackDiv.className = 'video-track';
 
   trackDiv.innerHTML = `
     <h3>Video Track ${i}</h3>
     <button class="record-btn">🎥 Record</button>
     <button class="upload-btn">📁 Upload</button>
     <button class="delete-btn">❌ Delete</button>
     <video class="preview" controls></video>
     <div class="recording-indicator"></div>
   `;
 
   videoTracksContainer.appendChild(trackDiv);
 
   const recordBtn = trackDiv.querySelector('.record-btn');
   const uploadBtn = trackDiv.querySelector('.upload-btn');
   const deleteBtn = trackDiv.querySelector('.delete-btn');
   const preview = trackDiv.querySelector('.preview');
   const indicator = trackDiv.querySelector('.recording-indicator');
 
   let mediaRecorder;
   let stream;
   let recordedChunks = [];
 
   recordBtn.addEventListener('click', async () => {
     if (mediaRecorder && mediaRecorder.state === 'recording') {
       mediaRecorder.stop();
       recordBtn.textContent = '🎥 Record';
       indicator.classList.remove('blinking');
     } else {
       try {
         stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
         preview.srcObject = stream;
         preview.muted = true;
         preview.play();
 
         recordedChunks = [];
         mediaRecorder = new MediaRecorder(stream);
 
         mediaRecorder.ondataavailable = event => {
           if (event.data.size > 0) recordedChunks.push(event.data);
         };
 // Function to "mix" the videos
 function mixVideos() {
   const selectedVideos = [];
 
         mediaRecorder.onstop = () => {
           if (recordedChunks.length > 0) {
             const blob = new Blob(recordedChunks, { type: 'video/webm' });
             const videoURL = URL.createObjectURL(blob);
             preview.srcObject = null;
             preview.src = videoURL;
             preview.controls = true;
             preview.play();
           }
 
           if (stream) stream.getTracks().forEach(track => track.stop());
           indicator.classList.remove('blinking');
         };
 
         mediaRecorder.start();
         recordBtn.textContent = '⏹ Stop';
         indicator.classList.add('blinking');
       } catch (err) {
         alert('Camera access denied or unavailable.');
         console.error(err);
   // Randomly select up to 5 videos with content
   videoTracks.forEach((video, index) => {
     if (video.src) {
       // Randomly decide whether to include this video in the mix (50% chance)
       if (Math.random() > 0.5) {
         selectedVideos.push(video);
       }
     }
   });
 
   uploadBtn.addEventListener('click', () => {
     const input = document.createElement('input');
     input.type = 'file';
     input.accept = 'video/*';
 
     input.onchange = () => {
       const file = input.files[0];
       if (file) {
         const videoURL = URL.createObjectURL(file);
         preview.src = videoURL;
         preview.controls = true;
         preview.play();
       }
     };
   // If no videos were selected, stop here
   if (selectedVideos.length === 0) {
     alert("No video tracks available for mixing.");
     return;
   }
 
     input.click();
   });
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
 
   deleteBtn.addEventListener('click', () => {
     preview.src = '';
     preview.srcObject = null;
     preview.pause();
   });
   mixedVideo.play(); // Play the mixed video
   console.log("Mixed video playing...");
 }
 
 // Roll Dice - Button Click Handler
 rollDiceBtn.addEventListener('click', () => {
   console.log("Rolling the dice...");
   mixVideos();
 });
