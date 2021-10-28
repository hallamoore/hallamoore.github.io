window.onkeydown = ev => {
  if (document.querySelectorAll(".highlighted").length === 0) {
    switch (ev.key) {
      case "Enter":
        solvePuzzle();
        break;
      case "Control":
        if (Object.keys(cellsByChar).length === 0) {
          nextPuzzle();
        }
        break;
      case ",":
        currentPlayer = 1;
        break;
      case ".":
        currentPlayer = 2;
        break;
      case "/":
        currentPlayer = 3;
        break;
      case "0":
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        currentMoneyPerLetter = parseInt(ev.key) * 100;
        break;
      default:
        guessLetter(ev.key);
        break;
    }
  }
};

window.onload = () => {
  nextPuzzle();

  for (i = 1; i <= 3; i++) {
    moneyByPlayerId[i] = new Money(i);
  }
};
