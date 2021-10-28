function repeatArray(n, value) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr.push(value);
  }
  return arr;
}

function padStartAndEnd(
  input,
  desiredLength,
  padValue,
  { favorStartPadding = true } = {}
) {
  const totalRemaining = desiredLength - input.length;
  const halfRemaining = totalRemaining / 2.0;
  let startRemaining, endRemaining;
  if (favorStartPadding) {
    startRemaining = Math.ceil(halfRemaining);
    endRemaining = Math.floor(halfRemaining);
  } else {
    startRemaining = Math.floor(halfRemaining);
    endRemaining = Math.ceil(halfRemaining);
  }
  if (typeof input === "string") {
    return input
      .padStart(input.length + startRemaining, padValue)
      .padEnd(input.length + totalRemaining, padValue);
  }
  if (input instanceof Array) {
    return [
      ...repeatArray(startRemaining, padValue),
      ...input,
      ...repeatArray(endRemaining, padValue)
    ];
  }
  throw Error("Unsupported input type");
}

function justify(input, maxLineLength) {
  const words = input.split(" ");
  let rows = [];
  let row;

  for (let word of words) {
    if (word.length > maxLineLength) {
      throw Error(`Words must be less than ${maxLineLength} characters`);
    }
    if (!row) {
      row = word;
    } else if (row.length + 1 + word.length <= maxLineLength) {
      row += " " + word;
    } else {
      rows.push(row);
      row = word;
    }
  }
  rows.push(row);
  return rows;
}
