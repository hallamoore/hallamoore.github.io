const testPuzzle = [
  ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"],
  ["_", "_", "_", "T", "H", "I", "S", "_", "I", "S", "_", "_", "_", "_"],
  ["_", "_", "_", "_", "A", "_", "T", "E", "S", "T", "_", "_", "_", "_"],
  ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"]
];

let cellsByChar = {};

function initPuzzle(puzzle) {
  cellsByChar = {};
  const rows = document.querySelectorAll("tr");

  for (let i = 0; i < rows.length; i++) {
    if (puzzle.length <= i) break;
    const puzzleRow = puzzle[i];
    const cells = rows[i].querySelectorAll("td");

    for (let j = 0; j < cells.length; j++) {
      if (puzzleRow.length <= j) break;
      const char = puzzleRow[j].toUpperCase();
      const cell = cells[j];
      cell.onclick = null;

      const img = cell.querySelector("img");
      if (char === "_") {
        img.src = "unused_cell.png";
      } else {
        if (!cellsByChar[char]) {
          cellsByChar[char] = [];
        }
        cellsByChar[char].push(cell);
        img.src = "";
      }
    }
  }
}

function guessLetter(char) {
  char = char.toUpperCase();
  if (!cellsByChar[char]) return;

  for (let cell of cellsByChar[char]) {
    cell.classList.add("highlighted");
    cell.onclick = () => {
      cell.append(char);
      cell.classList.remove("highlighted");
      cell.onclick = null;
    };
  }
}

window.onkeypress = ev => {
  if (document.querySelectorAll(".highlighted").length === 0) {
    guessLetter(ev.key);
  }
};

window.onload = () => {
  initPuzzle(testPuzzle);
};
