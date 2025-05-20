function renderTimelineChunks() {
  const container = document.getElementById('timeline-chunks');
  container.innerHTML = '';
  chunkStartEnd.forEach((chunk, i) => {
    const chunkDiv = document.createElement('div');
    chunkDiv.className = 'timeline-chunk' + (chunkStates[i].locked ? ' locked' : '') + (i === selectedChunk ? ' selected' : '');
    chunkDiv.title = chunkStates[i].locked ? 'Locked (click unlock to edit)' : 'Click to select chunk';
    chunkDiv.innerHTML = `
      <div>
        <strong>${i * barsPerChunk + 1}-${Math.round(chunk.end / ((60 / bpm) * 4))}</strong>
        <br>(${formatTime(chunk.start)}-${formatTime(chunk.end)})
      </div>
      <div class="chunk-controls"></div>
    `;

    // Show lock or unlock icon depending on state
    const iconSpan = document.createElement('span');
    if (chunkStates[i].locked) {
      iconSpan.className = 'lock-icon';
      iconSpan.innerHTML = '🔒';
    } else {
      iconSpan.className = 'unlock-icon';
      iconSpan.innerHTML = '🔓';
    }
    chunkDiv.appendChild(iconSpan);

    // Controls: play, dice, lock/unlock
    const controls = chunkDiv.querySelector('.chunk-controls');
    controls.innerHTML = '';

    // Play chunk
    const playBtn = document.createElement('button');
    playBtn.innerText = '▶ Play Chunk';
    playBtn.onclick = (e) => {
      e.stopPropagation();
      playChunk(i);
    };
    controls.appendChild(playBtn);

    // Dice edit
    const diceBtn = document.createElement('button');
    diceBtn.innerText = '🎲 Dice Edit';
    diceBtn.disabled = chunkStates[i].locked;
    diceBtn.onclick = (e) => {
      e.stopPropagation();
      diceEditChunk(i);
    };
    controls.appendChild(diceBtn);

    // Only show lock OR unlock button
    if (chunkStates[i].locked) {
      const unlockBtn = document.createElement('button');
      unlockBtn.innerText = '🔓 Unlock';
      unlockBtn.onclick = (e) => {
        e.stopPropagation();
        unlockChunk(i);
      };
      controls.appendChild(unlockBtn);
    } else {
      const lockBtn = document.createElement('button');
      lockBtn.innerText = '🔒 Lock';
      lockBtn.onclick = (e) => {
        e.stopPropagation();
        lockChunk(i);
      };
      controls.appendChild(lockBtn);
    }

    chunkDiv.onclick = () => {
      if (!chunkStates[i].locked) {
        selectedChunk = i;
        renderTimelineChunks();
      }
    };

    container.appendChild(chunkDiv);
  });
}
