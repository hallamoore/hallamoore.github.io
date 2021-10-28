const puzzles = [
  {
    category: "before & after",
    data: "zendesk ticket to ride"
  },
  {
    category: "before & after",
    data: "barcode read a book"
  },
  {
    category: "best sellers",
    data: "hpit torch with hsll"
  },
  {
    category: "best sellers",
    data: "dataman and insight"
  },
  {
    category: "family",
    data: "David and Jay Negro"
  },
  {
    category: "occupation",
    data: "Minister of Culture"
  },
  {
    category: "occupation",
    data: "Director of Products"
  },
  {
    category: "place",
    data: "Frisbee field"
  },
  {
    category: "place",
    data: "Aachen Germany"
  },
  {
    category: "place",
    data: "Cogercise Room"
  },
  {
    category: "rhyme time",
    data: "kite light at night"
  },
  {
    category: "rhyme time",
    data: "wren again"
  },
  {
    category: "rhyme time",
    data: "design a myna"
  },
  {
    category: "rhyme time",
    data: "eddie the yeti"
  },
  {
    category: "values",
    data: "sharing and integrity"
  },
  {
    category: "values",
    data: "creativity and enthusiasm"
  },
  {
    category: "values",
    data: "customer first and pride"
  },
  {
    category: "what are you doing?",
    data: "work hard"
  },
  {
    category: "what are you doing?",
    data: "play hard"
  },
  {
    category: "what are you doing?",
    data: "moving too fast"
  }
];

const emptyShortRow = [];
const emptyLongRow = [];
for (let i = 0; i < 12; i++) {
  emptyShortRow.push("_");
  emptyLongRow.push("_");
}
for (let i = 0; i < 2; i++) {
  emptyLongRow.push("_");
}

function createPuzzleLayout(input) {
  const words = input.split(" ");
  const rows = [];
  let row = "";
  for (let word of words) {
    if (row.length + 1 + word.length < 12) {
      row += " " + word;
    } else {
      const remainingChars = 12 - row.length;
      const x = remainingChars / 2.0;
      const a = Math.floor(x);
      const b = Math.ceil(x);
      row = row.padStart(row.length + a, " ");
      row = row.padEnd(row.length + b, " ");
      row = row.replaceAll(" ", "_");
      rows.push(row.split(""));
      row = word;
    }
  }

  const remainingChars = 12 - row.length;
  const x = remainingChars / 2.0;
  const a = Math.floor(x);
  const b = Math.ceil(x);
  console.log(remainingChars, x, a, b);
  row = row.padStart(row.length + a, " ");
  row = row.padEnd(row.length + b, " ");
  row = row.replaceAll(" ", "_");
  rows.push(row.split(""));

  console.log("a", rows);
  switch (rows.length) {
    case 1:
      return [
        emptyShortRow,
        ["_", ...rows[0], "_"],
        emptyLongRow,
        emptyShortRow
      ];
      break;
    case 2:
      return [
        emptyShortRow,
        ["_", ...rows[0], "_"],
        ["_", ...rows[1], "_"],
        emptyShortRow
      ];
      break;
    case 3:
      return [
        rows[0],
        ["_", ...rows[1], "_"],
        ["_", ...rows[2], "_"],
        emptyLongRow
      ];
      break;
    case 4:
      return rows;
      break;
    default:
      throw Error("More than 4 rows");
  }
}

let cellsByChar = {};
let currentPuzzleIndex = -1;

function nextPuzzle() {
  currentPuzzleIndex++;
  if (currentPuzzleIndex >= puzzles.length) {
    currentPuzzleIndex = 0;
  }
  const puzzle = puzzles[currentPuzzleIndex];
  const puzzleChars = createPuzzleLayout(puzzle.data);
  console.log(puzzleChars);

  document.querySelector("#category").innerText = puzzle.category.toUpperCase();
  cellsByChar = {};
  const rows = document.querySelectorAll("tr");

  for (let i = 0; i < rows.length; i++) {
    if (puzzleChars.length <= i) break;
    const puzzleRow = puzzleChars[i];
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
        if (Object.keys(cellsByChar).length === 0) {
          nextPuzzle();
        }
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
