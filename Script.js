// Dice Rolling Function
function rollDice() {
  const dice1 = document.getElementById("dice1");
  const dice2 = document.getElementById("dice2");

  const roll1 = Math.floor(Math.random() * 6) + 1;
  const roll2 = Math.floor(Math.random() * 6) + 1;

  dice1.src = `assets/dice-${roll1}.png`;
  dice2.src = `assets/dice-${roll2}.png`;

  console.log(`Rolled dice: ${roll1} and ${roll2}`);

  // This is where we will later trigger the random 8-bar video edit
  // For now, just log the result
  const totalBars = (roll1 + roll2) * 4;
  console.log(`Apply random edit for ${totalBars} bars.`);
}
