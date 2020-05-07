function formatKeyValueRow(key, value, valueStyle = "") {
  return `<div class='row'>
    <div class='key'>${key}</div>
    <div class='value' style="${valueStyle}">${value}</div>
  </div>`;
}

function formatAttrCheckbox(itemType, itemId, attrName, checked) {
  checkboxId = `${itemType}-${itemId}-${attrName}`;
  return `<input
            id='${checkboxId}'
            type="checkbox"
            data-item-type='${itemType}'
            data-item-id='${itemId}'
            data-attr-name='${attrName}'
            class='display-hidden'
            ${checked ? "checked" : ""}
            onchange='onAttrChange(event)'
          />
          <label for='${checkboxId}' class='icon'></label>`;
}

function toTitleCase(string) {
  return string
    .split(" ")
    .map((x) => x[0].toUpperCase() + x.substr(1))
    .join(" ");
}

function appendFish(id, fish) {
  $("#page").append(
    `<div class='item-container' id='${id}'>
      <div class='simple-item-content'>
        <img src="${fish.iconUrl}" class='item-icon'/>
        <span class='item-name'>${toTitleCase(fish.name)}</span>
        ${formatAttrCheckbox("fish", id, "caught", fish.caught)}
        ${formatAttrCheckbox("fish", id, "donated", fish.donated)}
        <img src="images/info.png" class='icon info'/>
      </div>
      <div class='item-details height-hidden'>
        ${formatKeyValueRow("Sell Price", fish.sellPrice)}
        ${formatKeyValueRow("Location", fish.location)}
        ${formatKeyValueRow("Times", fish.timeRanges)}
        ${formatKeyValueRow("Months", fish.monthRanges)}
        ${formatKeyValueRow("Shadow Size", fish.shadowSize)}
        ${formatKeyValueRow("Rarity", fish.rarity)}
      </div>
    </div>`
  );
}

function appendBug(id, bug) {
  $("#page").append(
    `<div class='item-container' id='${id}'>
      <div class='simple-item-content'>
        <img src="${bug.iconUrl}" class='item-icon'/>
        <span class='item-name'>${toTitleCase(bug.name)}</span>
        ${formatAttrCheckbox("bug", id, "caught", bug.caught)}
        ${formatAttrCheckbox("bug", id, "donated", bug.donated)}
        <img src="images/info.png" class='icon info'/>
      </div>
      <div class='item-details height-hidden'>
        ${formatKeyValueRow("Sell Price", bug.sellPrice)}
        ${formatKeyValueRow("Location", bug.location)}
        ${formatKeyValueRow("Weather", bug.weather)}
        ${formatKeyValueRow("Times", bug.timeRanges)}
        ${formatKeyValueRow("Months", bug.monthRanges)}
        ${formatKeyValueRow("Rarity", bug.rarity)}
      </div>
    </div>`
  );
}

const appendFnByItemType = {
  fish: appendFish,
  bug: appendBug,
};

function appendExistingItems(itemType) {
  for (let itemId in dataByType[itemType]) {
    let item = dataByType[itemType][itemId];
    appendFnByItemType[itemType](itemId, item);
  }
}
