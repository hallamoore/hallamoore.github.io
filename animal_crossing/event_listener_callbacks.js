function onAttrChange(e) {
  let itemType = $(e.target).attr("data-item-type");
  let itemId = $(e.target).attr("data-item-id");
  let attrName = $(e.target).attr("data-attr-name");
  let item = dataByType[itemType][itemId];
  let itemName = item.name;
  let attrValue = e.target.checked ? 1 : 0;

  item[attrName] = attrValue;

  $.ajax({
    method: "POST",
    url: URL,
    dataType: "json",
    data: JSON.stringify({
      session,
      action: "updateAttr",
      actionArgs: [username, itemType, itemId, itemName, attrName, attrValue],
    }),
    success: wrapWithErrorCheck(function (data, textStatus, jqXHR) {
      // Do nothing, but still include callback in case the wrapped error check
      // gets triggered
    }),
    error: function (jqXHR, textStatus, errorString) {
      console.log(textStatus, errorString);
      alert(`${attrName} status update for ${itemName} failed`);
    },
  });
}

function listenForInfoToggle() {
  $("#page").on("click", ".info", function (e) {
    $(e.target.parentElement.parentElement)
      .children(".item-details")
      .toggleClass("height-hidden");
  });
}
