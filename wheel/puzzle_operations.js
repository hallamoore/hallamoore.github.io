let cellsByChar = {};
let currentPuzzleIndex = -1;

function nextPuzzle() {
  currentPuzzleIndex++;
  if (currentPuzzleIndex >= puzzles.length) {
    currentPuzzleIndex = 0;
  }

  const puzzle = puzzles[currentPuzzleIndex];
  const puzzleLayout = createPuzzleLayout(puzzle.data);

  document.querySelector("#category").innerText = puzzle.category.toUpperCase();

  cellsByChar = {};
  const rows = document.querySelectorAll("tr");
  for (let i = 0; i < rows.length; i++) {
    const puzzleRow = puzzleLayout[i];
    const cells = rows[i].querySelectorAll("td");

    for (let j = 0; j < cells.length; j++) {
      const cell = cells[j];
      cell.onclick = null;

      if (cell.childNodes.length == 2) {
        // This cell had text appended to it as part of the last puzzle. Remove that text.
        cell.childNodes[1].remove();
      }

      const img = cell.querySelector("img");
      const char = puzzleRow[j].toUpperCase();
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

function createPuzzleLayout(input) {
  let rows = justify(input, 12);

  if (rows.length === 1) {
    const words = rows[0].split(" ");
    if (words.length > 1) {
      // Let's split this up into two rows
      const numChars = rows[0].replaceAll(" ", "").length;
      const maxWordLength = Math.max(...words.map(word => word.length));
      const shorterLineLength = Math.max(
        Math.ceil(numChars / 2),
        maxWordLength
      );
      rows = justify(input, shorterLineLength);
    }
  }

  const maxLength = Math.max(...rows.map(r => r.length));
  const numStartPadding = Math.ceil((14 - maxLength) / 2);

  rows = rows.map(row =>
    row
      .padStart(row.length + numStartPadding, "_")
      .padEnd(14, "_")
      .replaceAll(" ", "_")
      .split("")
  );

  const emptyRow = repeatArray(14, "_");
  return padStartAndEnd(rows, 4, emptyRow, { favorStartPadding: false });
}

function guessLetter(char) {
  char = char.toUpperCase();
  if (!cellsByChar[char]) {
    nextPlayer();
    return;
  }

  if (["A", "E", "I", "O", "U"].includes(char)) {
    deductVowelCost();
  } else {
    rewardMoney(cellsByChar[char].length);
  }

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
