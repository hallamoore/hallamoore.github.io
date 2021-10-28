let cellsByChar = {};
let currentPuzzleIndex = -1;

function removeTextFromCell(cell) {
  // The first node is the img
  if (cell.childNodes.length == 2) {
    cell.childNodes[1].remove();
  }
}

function nextPuzzle() {
  const previousIndex = currentPuzzleIndex;
  let nextIndex = (currentPuzzleIndex + 1) % puzzles.length;

  function _nextPuzzle(index) {
    currentPuzzleIndex = index;
    const puzzle = puzzles[currentPuzzleIndex];
    const puzzleLayout = createPuzzleLayout(puzzle.data);

    document.querySelector(
      "#category"
    ).innerText = puzzle.category.toUpperCase();

    cellsByChar = {};
    const rows = document.querySelectorAll("tr");
    for (let i = 0; i < rows.length; i++) {
      const puzzleRow = puzzleLayout[i];
      const cells = rows[i].querySelectorAll("td");

      for (let j = 0; j < cells.length; j++) {
        const cell = cells[j];
        cell.onclick = null;
        removeTextFromCell(cell);

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

  _nextPuzzle(nextIndex);

  recordAction({
    redo: () => _nextPuzzle(nextIndex),
    undo: () => {
      _nextPuzzle(previousIndex);
      for (let [char, cells] of Object.entries(cellsByChar)) {
        for (let cell of cells) {
          cell.append(char);
        }
      }
      cellsByChar = {};
    }
  });
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
  const cells = cellsByChar[char];
  if (!cells) {
    nextPlayer();
    return;
  }

  openActionGroup();

  if (["A", "E", "I", "O", "U"].includes(char)) {
    deductVowelCost();
  } else {
    rewardMoney(cells.length);
  }

  function doAction() {
    for (let cell of cells) {
      cell.classList.add("highlighted");
      cell.onclick = () => {
        cell.append(char);
        cell.classList.remove("highlighted");
        cell.onclick = null;
      };
    }
    delete cellsByChar[char];
  }

  function undoAction() {
    for (let cell of cells) {
      cell.classList.remove("highlighted");
      cell.onclick = null;
      removeTextFromCell(cell);
    }
    cellsByChar[char] = cells;
  }

  doAction();

  recordAction({ redo: doAction, undo: undoAction });

  closeActionGroup();
}

function solvePuzzle() {
  const previousCellsByChar = { ...cellsByChar };

  function doAction() {
    for (let [char, cells] of Object.entries(cellsByChar)) {
      for (let cell of cells) {
        cell.append(char);
      }
    }
    cellsByChar = {};
  }

  function undoAction() {
    for (let [char, cells] of Object.entries(previousCellsByChar)) {
      for (let cell of cells) {
        removeTextFromCell(cell);
      }
    }
    cellsByChar = previousCellsByChar;
  }

  doAction();

  recordAction({ redo: doAction, undo: undoAction });
}
