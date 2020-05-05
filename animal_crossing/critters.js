function loadCritters() {
  $("#main-content").html(
    `<div class="header">
        <div class="tab" onclick="switchTab(event, 'bugs')">Bugs</div>
        <div class="tab active-tab" onclick="switchTab(event, 'fish')">Fish</div>
      </div>
      <div id="page"></div>`
  );
  listenForInfoToggle();
  loadItems(ITEM_TYPES.Fish);
}
