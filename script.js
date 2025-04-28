document.addEventListener('DOMContentLoaded', () => {
  const recordBtn = document.getElementById('record-btn');
  const indicator = document.getElementById('indicator');
  const preview = document.getElementById('preview');
  const masterAudio = document.getElementById('master-track');
  const videoTracksContainer = document.getElementById('video-tracks-container');
  const trackCount = 10;
  let selectedTrackIndex = null;
  let mediaRecorder;
  let stream;
  let recordedChunks = [];

  // Create 10 video tracks
  for (let i = 1; i <= trackCount; i++) {
    const trackContainer = document.createElement('div');
    trackContainer.classList.add('video-track');
    trackContainer.id = `track-${i}`;
    
    const selectBtn = document.createElement('button');
    selectBtn.textContent = `Select Track ${i}`;
    selectBtn.classList.add('select-btn');
    
    // Select button functionality
    selectBtn.addEventListener('click', () => {
      document.querySelectorAll('.video-track').forEach(track => track.classList.remove('selected'));
      trackContainer.classList.add('selected');
      selectedTrackIndex = i;
      console.log(`Track ${i} selected`);
    });

    trackContainer.appendChild(selectBtn);
    videoTracksContainer.appendChild(trackContainer);
  }

  // Handle recording functionality
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
        // Request video and audio stream from webcam and microphone
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
          video.style.width = '640px';  // YouTube-like size
          video.style.height = '360px'; // YouTube-like size
          video.style.borderRadius = '10px';

          // Append recorded video to the selected track
          const track = document.getElementById(`track-${selectedTrackIndex}`);
          if (track) {
            track.appendChild(video);
          } else {
            console.error(`Track ${selectedTrackIndex} not found!`);
          }

          // Automatically download the recorded video
          const a = document.createElement('a');
          a.href = url;
          a.download = `recording-${new Date().toISOString()}.webm`;
          a.click();

          preview.srcObject = null;
          preview.style.display = 'none';

          if (stream) stream.getTracks().forEach(track => track.stop());
          indicator.classList.remove('blinking');
        };

        // Start recording
        mediaRecorder.start();
        masterAudio.currentTime = 0;
        masterAudio.play();
        recordBtn.textContent = '⏹ Stop';
        indicator.classList.add('blinking');
      } catch (err) {
        console.error(err);
        alert('Failed to access camera/mic.');
      }
    }
  });
});
