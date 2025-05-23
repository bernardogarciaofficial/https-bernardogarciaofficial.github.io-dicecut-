// DiceCut Demo Script

// --- Simulated State ---
let audioUploaded = false;
let videoTakes = Array(10).fill(false); // Tracks which takes are 'recorded'
let currentTake = null;
let editedSegments = [];
let outputVideoReady = false;

// --- DOM Elements ---
const uploadInput = document.createElement("input");
uploadInput.type = "file";
uploadInput.accept = "audio/*";

const diceResult = document.getElementById("dice-result");
const signupBtn = document.getElementById('signup-btn');

// Simulate Audio Upload
function handleAudioUpload() {
  uploadInput.click();
  uploadInput.onchange = (e) => {
    if (uploadInput.files.length > 0) {
      audioUploaded = true;
      alert("Audio uploaded! Waveform and bar lines generated.");
    }
  };
}

// Simulate Recording Video Takes
function recordTake(index) {
  if (!audioUploaded) {
    alert("Please upload your song first!");
    return;
  }
  if (videoTakes[index]) {
    alert(`Take ${index + 1} already recorded.`);
    return;
  }
  currentTake = index;
  alert(`Recording Take ${index + 1}...\n(Countdown 3-2-1, music plays in sync)`);
  setTimeout(() => {
    videoTakes[index] = true;
    alert(`Take ${index + 1} recorded and synced!`);
    currentTake = null;
  }, 1500);
}

// Simulate Dice Edit
function rollDiceEdit(full = true) {
  if (!videoTakes.every(Boolean)) {
    diceResult.textContent = "Please record all 10 video takes first!";
    return;
  }
  if (full) {
    diceResult.textContent = "🎲 Full Song Edit: " + rollEditResult();
    outputVideoReady = true;
  } else {
    const segment = "8-Bar Segment " + (editedSegments.length + 1);
    const result = rollEditResult();
    diceResult.textContent = `🎲 ${segment}: ${result}`;
    editedSegments.push(result);
    if (editedSegments.length >= 5) { // Assume 5 segments for demo
      outputVideoReady = true;
      diceResult.textContent += "\nAll segments edited! Video ready to preview.";
    }
  }
}

// Simulate Edit Results
function rollEditResult() {
  const edits = [
    "Seamless cuts with energetic transitions!",
    "Cinematic dissolves and dynamic angles.",
    "Flashy effects and smooth scene changes.",
    "Quick cuts for a high-energy vibe.",
    "Moody transitions and stylish overlays.",
    "Classic edits with natural flow.",
    "Pop-art effects and rhythmic edits.",
    "Super smooth, minimalistic cuts.",
    "Randomized for maximum creativity!",
    "Vintage filters and dramatic transitions."
  ];
  return edits[Math.floor(Math.random() * edits.length)];
}

// Simulate Preview and Export
function previewAndExport() {
  if (!outputVideoReady) {
    alert("Please finish editing your video first!");
    return;
  }
  alert("Previewing your completed video!\nClick 'Export' to download your music video.");
  setTimeout(() => {
    alert("Video exported! Ready to share with the world.");
  }, 1000);
}

// Hook up Dice Buttons
document.getElementById('dice-full').addEventListener('click', () => rollDiceEdit(true));
document.getElementById('dice-step').addEventListener('click', () => rollDiceEdit(false));

// Simulate Take Recording Buttons (demo, not rendered in original HTML)
const howItWorksSection = document.querySelector('.how-it-works');
if (howItWorksSection) {
  const takesDiv = document.createElement('div');
  takesDiv.style.margin = "1em 0";
  takesDiv.innerHTML = "<strong>Record Takes:</strong> ";
  for (let i = 0; i < 10; i++) {
    const btn = document.createElement('button');
    btn.textContent = `Take ${i + 1}`;
    btn.style.marginRight = "0.2em";
    btn.addEventListener('click', () => recordTake(i));
    takesDiv.appendChild(btn);
  }
  howItWorksSection.appendChild(takesDiv);

  // Simulate audio upload button
  const audioBtn = document.createElement('button');
  audioBtn.textContent = "Upload Song";
  audioBtn.style.margin = "0.6em 0.5em";
  audioBtn.addEventListener('click', handleAudioUpload);
  howItWorksSection.insertBefore(audioBtn, howItWorksSection.firstChild);

  // Simulate preview/export button
  const previewBtn = document.createElement('button');
  previewBtn.textContent = "Preview & Export";
  previewBtn.style.marginLeft = "1em";
  previewBtn.addEventListener('click', previewAndExport);
  howItWorksSection.appendChild(previewBtn);
}

// Signup
signupBtn.addEventListener('click', function() {
  alert("Sign up coming soon! Stay tuned for DiceCut's launch.");
});
