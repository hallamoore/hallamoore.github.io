const puzzles = [
  {
    category: "phrase",
    chars: [
      ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"],
      ["_", "_", "_", "T", "H", "I", "S", "_", "I", "S", "_", "_", "_", "_"],
      ["_", "_", "_", "_", "A", "_", "T", "E", "S", "T", "_", "_", "_", "_"],
      ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"]
    ]
  },
  {
    category: "place",
    chars: [
      ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"],
      ["_", "_", "_", "B", "A", "C", "K", "Y", "A", "R", "D", "_", "_", "_"],
      ["_", "_", "_", "_", "P", "A", "T", "I", "O", "_", "_", "_", "_", "_"],
      ["_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_", "_"]
    ]
  }
];

let cellsByChar = {};
let currentPuzzleIndex = -1;

function nextPuzzle() {
  currentPuzzleIndex++;
  const puzzle = puzzles[currentPuzzleIndex];

  document.querySelector("#category").innerText = puzzle.category.toUpperCase();
  cellsByChar = {};
  const rows = document.querySelectorAll("tr");

  for (let i = 0; i < rows.length; i++) {
    if (puzzle.chars.length <= i) break;
    const puzzleRow = puzzle.chars[i];
    const cells = rows[i].querySelectorAll("td");

    for (let j = 0; j < cells.length; j++) {
      if (puzzleRow.length <= j) break;
      const char = puzzleRow[j].toUpperCase();
      const cell = cells[j];
      cell.onclick = null;

      if (cell.childNodes.length == 2) {
        // This cell had text appended to it as part of the last puzzle. Remove that text.
        cell.childNodes[1].remove();
      }

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
  delete cellsByChar[char];
}

function solvePuzzle() {
  for (let [char, cells] of Object.entries(cellsByChar)) {
    for (let cell of cells) {
      cell.append(char);
    }
  }
  cellsByChar = {};
}

window.onkeydown = ev => {
  if (document.querySelectorAll(".highlighted").length === 0) {
    switch (ev.key) {
      case "Enter":
        solvePuzzle();
        break;
      case "Control":
        nextPuzzle();
        break;
      default:
        guessLetter(ev.key);
        break;
    }
  }
};

window.onload = () => {
  nextPuzzle();
};
