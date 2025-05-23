// DiceCut UI starter logic

// Profile Dropdown
document.querySelector('.avatar').addEventListener('click', function() {
  document.querySelector('.profile-dropdown ul').classList.toggle('show');
});

// Simulate Waveform
const waveform = document.getElementById('waveform');
document.getElementById('audio-upload').addEventListener('change', function(e) {
  waveform.innerHTML = '<span>🎵 Audio Loaded! (Simulated waveform display)</span>';
});

// Bar Navigation
const barElems = document.querySelectorAll('.bar');
barElems.forEach(bar => {
  bar.addEventListener('click', function() {
    barElems.forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    // Simulate jumping to bar in audio
    waveform.innerHTML = `<span>Jumped to Bar ${this.dataset.bar}</span>`;
  });
});

// Main Preview Video
const mainPreview = document.getElementById('main-preview');

// Takes Panel - Recording Simulation
const recordButtons = document.querySelectorAll('.record-btn');
const countdownModal = document.getElementById('countdown-modal');
const countdownNumber = document.getElementById('countdown-number');
recordButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    // Simulate camera permission
    if (confirm('Allow camera access for DiceCut to record your take?')) {
      // Show countdown modal
      countdownModal.style.display = 'flex';
      let count = 3;
      countdownNumber.textContent = count;
      btn.disabled = true;
      btn.classList.add('active');
      const interval = setInterval(() => {
        count--;
        countdownNumber.textContent = count > 0 ? count : '🎬';
        if (count === 0) {
          clearInterval(interval);
          setTimeout(() => {
            countdownModal.style.display = 'none';
            // Simulate recording: 3 seconds
            btn.textContent = 'Recording...';
            setTimeout(() => {
              btn.textContent = 'Recorded!';
              btn.style.background = '#7d5fff';
              btn.disabled = false;
              btn.classList.remove('active');
            }, 3000);
          }, 700);
        }
      }, 1000);
    }
  });
});

// Editing Modes
const fullSongBtn = document.getElementById('full-song-btn');
const barEditBtn = document.getElementById('bar-edit-btn');
const fullSongDice = document.getElementById('full-song-dice');
const barEditControls = document.getElementById('bar-edit-controls');
const barEditLabel = document.getElementById('bar-edit-label');
let currentBarSegment = 1;

fullSongBtn.addEventListener('click', () => {
  fullSongBtn.classList.add('active');
  barEditBtn.classList.remove('active');
  fullSongDice.style.display = 'flex';
  barEditControls.style.display = 'none';
});

barEditBtn.addEventListener('click', () => {
  barEditBtn.classList.add('active');
  fullSongBtn.classList.remove('active');
  fullSongDice.style.display = 'none';
  barEditControls.style.display = 'flex';
  updateBarEditLabel();
});

function updateBarEditLabel() {
  barEditLabel.textContent = `Bars ${1 + 8 * (currentBarSegment - 1)}-${8 * currentBarSegment}`;
}

// Dice Editing (Simulation)
fullSongDice.querySelectorAll('.dice-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    mainPreview.poster = '';
    mainPreview.innerHTML = '';
    mainPreview.style.background = '#7d5fff';
    setTimeout(() => {
      mainPreview.style.background = '#1d1c24';
      alert('🎲 Random edit generated for FULL SONG! (Simulated)');
    }, 1200);
  });
});
document.getElementById('bar-dice-btn').addEventListener('click', () => {
  mainPreview.style.background = '#f23b5b';
  setTimeout(() => {
    mainPreview.style.background = '#1d1c24';
    alert(`🎲 Random edit for Bars ${1 + 8 * (currentBarSegment - 1)}-${8 * currentBarSegment} (Simulated)`);
  }, 900);
});
document.getElementById('lock-bar-btn').addEventListener('click', () => {
  alert(`🔒 Locked Bars ${1 + 8 * (currentBarSegment - 1)}-${8 * currentBarSegment}`);
});

// Bar Navigation for 8-Bar Edit
document.getElementById('prev-bar-btn').addEventListener('click', () => {
  if (currentBarSegment > 1) {
    currentBarSegment--;
    updateBarEditLabel();
  }
});
document.getElementById('next-bar-btn').addEventListener('click', () => {
  currentBarSegment++;
  updateBarEditLabel();
});

// Effects & Filters (Simulation)
document.querySelectorAll('.effects-panel input[type="checkbox"]').forEach(chk => {
  chk.addEventListener('change', () => {
    alert(`Effect "${chk.id}" ${chk.checked ? 'enabled' : 'disabled'} (Simulated)`);
  });
});

// Playback Controls (Simulated)
document.getElementById('play-btn').addEventListener('click', () => {
  waveform.innerHTML = '<span>▶️ Playing...</span>';
});
document.getElementById('pause-btn').addEventListener('click', () => {
  waveform.innerHTML = '<span>⏸️ Paused</span>';
});
document.getElementById('rewind-btn').addEventListener('click', () => {
  waveform.innerHTML = '<span>⏪ Rewinded</span>';
});
document.getElementById('ff-btn').addEventListener('click', () => {
  waveform.innerHTML = '<span>⏩ Fast-Forwarded</span>';
});
document.getElementById('loop-btn').addEventListener('click', () => {
  alert('🔁 Loop enabled (Simulated)');
});

// Export Controls (Simulated)
document.getElementById('preview-btn').addEventListener('click', () => {
  mainPreview.play();
});
document.getElementById('export-btn').addEventListener('click', () => {
  const indicator = document.getElementById('progress-indicator');
  const progress = document.getElementById('render-progress');
  indicator.style.display = 'flex';
  progress.value = 0;
  let val = 0;
  const interval = setInterval(() => {
    val += 7 + Math.random() * 10;
    if (val >= 100) {
      progress.value = 100;
      clearInterval(interval);
      setTimeout(() => {
        indicator.style.display = 'none';
        alert('✅ Export complete! (Simulated)');
      }, 700);
    } else {
      progress.value = val;
    }
  }, 220);
});

// Hide dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.navbar-right')) {
    document.querySelector('.profile-dropdown ul').classList.remove('show');
  }
});
