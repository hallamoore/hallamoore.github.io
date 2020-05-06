function loadHome() {
  loadItems(
    ITEM_TYPES.Fish,
    () => updateProgress(ITEM_TYPES.Fish),
    () => updateProgress(ITEM_TYPES.Fish)
  );
  loadItems(
    ITEM_TYPES.Bug,
    () => updateProgress(ITEM_TYPES.Bug),
    () => updateProgress(ITEM_TYPES.Bug)
  );
  $("#main-content").html(
    `<div class="home-section">
      <div class='home-section-header'>Critter Progress</div>
      <div class='home-section-details'>
        ${formatProgressRow(ITEM_TYPES.Fish, "Fish")}
        ${formatProgressRow(ITEM_TYPES.Bug, "Bugs")}
      </div>
    </div>` +
      `
    <div>
    clientHeight: <span id='a'>${document.documentElement.clientHeight}</span></br>
    innerHeight: <span id='b'>${window.innerHeight}</span><br/>
    <br/>
    clientWidth: <span id='c'>${document.documentElement.clientWidth}</span></br>
    innerWidth: <span id='d'>${window.innerWidth}</span><br/>
    </div>
    `
  );
}

function formatProgressRow(itemType, key) {
  let currentNum = numWithAttrValue(itemType, "caught", 1);
  let total = totalItemsOfType(itemType);
  return formatKeyValueRow(
    key,
    `<span id="${itemType}-num-caught">
        ${currentNum}
     </span>
     /
     <span id="${itemType}-total">
      ${total}
     </span>`,
    `background-size: ${(100 * currentNum) / total}% 100%;`
  );
}

function updateProgress(itemType) {
  $(`#${itemType}-num-caught`).html(numWithAttrValue(itemType, "caught", 1));
  $(`#${itemType}-total`).html(totalItemsOfType(itemType));
}

function numWithAttrValue(itemType, attrName, attrValue) {
  return Object.values(dataByType[itemType]).filter(
    (i) => i[attrName] === attrValue
  ).length;
}

function totalItemsOfType(itemType) {
  if (!dataByType[itemType]) {
    return 0;
  }
  return Object.values(dataByType[itemType]).length;
}
