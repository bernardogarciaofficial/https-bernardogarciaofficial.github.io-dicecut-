// Add at the end or in a suitable place for DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
    // --- MEMBER COUNTER ---
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

    // --- VIDEO TRACKS: Show all 10 video tracks, vertically stacked ---
    createAllVideoTracks();
});

function createAllVideoTracks() {
    videosGrid.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'video-track';
        trackDiv.dataset.track = i;

        // Track label
        const label = document.createElement('span');
        label.className = 'track-label';
        label.textContent = `Take ${i + 1}`;
        trackDiv.appendChild(label);

        // Recording indicator
        const recInd = document.createElement('span');
        recInd.className = 'recording-indicator';
        recInd.textContent = '● Recording...';
        recInd.style.display = 'none';
        trackDiv.appendChild(recInd);

        // Thumbnail preview
        const thumb = document.createElement('img');
        thumb.className = 'thumb-preview hidden';
        thumb.alt = 'Preview';
        if (videoBlobs[i]) {
            thumb.src = URL.createObjectURL(videoBlobs[i]);
            thumb.classList.remove('hidden');
        }
        trackDiv.appendChild(thumb);

        // Video element
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
        recBtn.onclick = () => handleRecord(i, recBtn, videoEl, thumb, trackDiv, recInd);
        if (isRecording[i]) recBtn.classList.add('recording');
        trackDiv.appendChild(recBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.innerHTML = '🗑️';
        delBtn.title = 'Delete this take';
        delBtn.onclick = () => deleteTake(i, videoEl, recBtn, thumb, trackDiv);
        delBtn.style.display = videoBlobs[i] ? '' : 'none';
        trackDiv.appendChild(delBtn);

        if (isRecording[i]) trackDiv.classList.add('recording');
        videosGrid.appendChild(trackDiv);
    }
}

// --- WAVEFORM: Improved 8-bar lines and labels ---
function drawBarRegions() {
    if (!wavesurfer) return;
    wavesurfer.clearRegions();
    barRegions = [];
    let secPerBar = 60 / bpm * 4;
    for (let i = 0; i < barCount; i++) {
        let color = (i % 8 === 0) ? 'rgba(255, 107, 107, 0.35)' : 'rgba(84, 19, 136, 0.11)';
        let region = wavesurfer.addRegion({
            start: i * secPerBar,
            end: (i + 1) * secPerBar,
            color: color
        });
        barRegions.push(region);

        // Add label for every 8th bar
        if (i % 8 === 0) {
            let barLabel = document.createElement('div');
            barLabel.className = 'bar-label';
            barLabel.style.position = 'absolute';
            barLabel.style.left = `${(i / barCount) * 100}%`;
            barLabel.style.top = '0';
            barLabel.style.fontSize = '0.9em';
            barLabel.style.color = '#ff6b6b';
            barLabel.style.fontWeight = 'bold';
            barLabel.textContent = `Bar ${i + 1}`;
            waveformDiv.appendChild(barLabel);
        }
    }
}
