function rollDice() {
  alert("Dice rolled! Random edit in progress...");
}// Get all Record buttons
const recordButtons = document.querySelectorAll('.record-btn');
recordButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    console.log(`🎙️ Record button clicked on track ${index + 1}`);
  });
});

// Get all Upload buttons
const uploadButtons = document.querySelectorAll('.upload-btn');
uploadButtons.forEach((btn, index) => {
  btn.addEventListener('click', () => {
    console.log(`📁 Upload button clicked on track ${index + 1}`);
  });
});

