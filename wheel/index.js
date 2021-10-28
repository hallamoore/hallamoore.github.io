window.onkeydown = ev => {
  if (document.querySelectorAll(".highlighted").length === 0) {
    if (ev.key === "Enter") {
      solvePuzzle();
    } else if (ev.key === "Control" && Object.keys(cellsByChar).length === 0) {
      nextPuzzle();
    } else if (ev.key === ",") {
      changePlayer(1);
    } else if (ev.key === ".") {
      changePlayer(2);
    } else if (ev.key === "/") {
      changePlayer(3);
      ev.preventDefault();
    } else if (ev.key.match(/^\d$/)) {
      currentMoneyPerLetter = parseInt(ev.key) * 100;
    } else if (ev.key.match(/^[a-zA-Z]$/)) {
      guessLetter(ev.key);
    }
  }
};

window.onload = () => {
  nextPuzzle();

  for (i = 1; i <= 3; i++) {
    moneyByPlayerId[i] = new Money(i);
  }

  changePlayer(1);
};
