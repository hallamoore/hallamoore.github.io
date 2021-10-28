const buzzerAudio = new Audio("./buzzer.mp3");
const dingAudios = [];
const solveAudio = new Audio("./solve.mp3");
const waitingAudio = new Audio("./waiting.mp3");
const bankruptAudio = new Audio("./bankrupt.mp3");
solveAudio.volume = 0.3;
bankruptAudio.volume = 0.1;
waitingAudio.volume = 0.4;

window.onkeydown = ev => {
  const key = ev.key.toLowerCase();
  if (document.querySelectorAll(".highlighted").length === 0) {
    if (key === "enter") {
      solvePuzzle();
    } else if (key === "tab" && Object.keys(cellsByChar).length === 0) {
      nextPuzzle();
    } else if (key === ",") {
      changePlayer(1);
    } else if (key === ".") {
      changePlayer(2);
    } else if (key === "/") {
      changePlayer(3);
      ev.preventDefault();
    } else if (key.match(/^\d$/)) {
      if (key === "0") {
        changeMoneyPerLetter(1000);
      } else {
        changeMoneyPerLetter(parseInt(key) * 100);
      }
    } else if (key === " ") {
      changeMoneyPerLetter(currentMoneyPerLetter + 50);
    } else if (key.match(/^[a-zA-Z]$/) && !ev.ctrlKey) {
      guessLetter(key);
    } else if (key === "y" && ev.ctrlKey) {
      redo();
    } else if (key === "r" && ev.ctrlKey) {
      openActionGroup();
      for (let money of Object.values(moneyByPlayerId)) {
        money.resetToZero();
      }
      resetPuzzle();
      closeActionGroup();
      ev.preventDefault();
      ev.stopPropagation();
    } else if (key === "b" && ev.ctrlKey) {
      openActionGroup();
      moneyByPlayerId[currentPlayer].resetToZero();
      nextPlayer();
      closeActionGroup();
      bankruptAudio.play();
      ev.preventDefault();
    }
  }
  if (key === "z" && ev.ctrlKey) {
    undo();
  } else if (key === "capslock") {
    if (waitingAudio.paused) {
      waitingAudio.play();
    } else {
      waitingAudio.pause();
    }
  }
};

window.onload = () => {
  nextPuzzle();

  for (i = 1; i <= 3; i++) {
    moneyByPlayerId[i] = new Money(i);
  }

  changePlayer(1);

  clearUndoRedoHistory();
};
