document.addEventListener('DOMContentLoaded', function () {
    fetch('get_member_count.php')
        .then(response => response.text())
        .then(count => {
            const counter = document.getElementById('member-counter');
            if (counter) {
                counter.textContent = `👤 Members: ${count}`;
            }
        })
        .catch(() => {
            const counter = document.getElementById('member-counter');
            if (counter) {
                counter.textContent = `👤 Members: N/A`;
            }
        });

    createAllVideoTracks();
});

let videosGrid = document.getElementById('videos-grid');
let videoBlobs = Array(10).fill(null);
let isRecording = Array(10).fill(false);

function createAllVideoTracks() {
    videosGrid.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'video-track';
        trackDiv.dataset.track = i;

        const label = document.createElement('span');
        label.className = 'track-label';
        label.textContent = `Take ${i + 1}`;
        trackDiv.appendChild(label);

        const recInd = document.createElement('span');
        recInd.className = 'recording-indicator';
        recInd.textContent = '● Recording...';
        recInd.style.display = 'none';
        trackDiv.appendChild(recInd);

        const thumb = document.createElement('img');
        thumb.className = 'thumb-preview hidden';
        thumb.alt = 'Preview';
        if (videoBlobs[i]) {
            thumb.src = URL.createObjectURL(videoBlobs[i]);
            thumb.classList.remove('hidden');
        }
        trackDiv.appendChild(thumb);

        const videoEl = document.createElement('video');
        videoEl.setAttribute('playsinline', true);
        videoEl.setAttribute('controls', true);
        videoEl.id = `video-take-${i}`;
        videoEl.style.display = videoBlobs[i] ? '' : 'none';
        if (videoBlobs[i]) videoEl.src = URL.createObjectURL(videoBlobs[i]);
        trackDiv.appendChild(videoEl);

        if (!videoBlobs[i] && !isRecording[i]) {
            const msg = document.createElement('div');
            msg.className = 'no-video-msg';
            msg.textContent = "No video recorded yet.";
            trackDiv.appendChild(msg);
        }

        const recBtn = document.createElement('button');
        recBtn.className = 'record-btn';
        recBtn.textContent = videoBlobs[i] ? 'Re-record' : 'Record';
        trackDiv.appendChild(recBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.title = 'Delete this take';
        delBtn.style.display = videoBlobs[i] ? '' : 'none';
       
::contentReference[oaicite:1]{index=1}
 
