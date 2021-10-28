let undoQueue = [];
let redoQueue = [];
let actionGroup;

function undo() {
  const entry = undoQueue.pop();
  if (!entry) return;

  if (entry instanceof Array) {
    for (groupedEntry of entry) {
      groupedEntry.undo();
    }
  } else {
    entry.undo();
  }
  redoQueue.push(entry);
}

function redo() {
  const entry = redoQueue.pop();
  if (!entry) return;

  if (entry instanceof Array) {
    for (groupedEntry of entry) {
      groupedEntry.redo();
    }
  } else {
    entry.redo();
  }
  undoQueue.push(entry);
}

function recordAction(entry) {
  redoQueue = [];
  if (actionGroup) {
    actionGroup.push(entry);
  } else {
    undoQueue.push(entry);
  }
}

function openActionGroup() {
  if (actionGroup) {
    throw Error("Tried opening two action groups at the same time");
  }
  actionGroup = [];
}

function closeActionGroup() {
  undoQueue.push(actionGroup);
  actionGroup = null;
}

function clearUndoRedoHistory() {
  undoQueue = [];
  redoQueue = [];
}
