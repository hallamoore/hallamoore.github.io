function loadCritters() {
  $("#main-content").html(
    `<div id="critter-header">
        <div class="tab" onclick="switchTab(event, 'bugs')">Bugs</div>
        <div class="tab active-tab" onclick="switchTab(event, 'fish')">Fish</div>
        <div class='filter-menu-icon' onclick='showFilterMenu(event)'><div></div><div></div><div></div></div>
        <div id='filter-menu' style='display:none'>
          <div id='filter-labels'>
            <div>Caught:</div>
            <div>Donated:</div>
          </div>
          <div id='filter-options-container'>
            <div class='filter-options' data-attr-name='caught'>
              ${filterOptionHTML("Any", true)}
              ${filterOptionHTML("Yes", false)}
              ${filterOptionHTML("No", false)}
            </div>
            <div class='filter-options' data-attr-name='donated'>
              ${filterOptionHTML("Any", true)}
              ${filterOptionHTML("Yes", false)}
              ${filterOptionHTML("No", false)}
            </div>
          </div>
        </div>
      </div>
      <div id="page"></div>`
  );
  listenForInfoToggle();
  loadItems(ITEM_TYPES.Fish);
}

function showFilterMenu(e) {
  e.stopPropagation();
  $("#filter-menu").toggle();
  $("body").click((e) => {
    if ($(e).parents("#filter-menu").length == 0) {
      closeFilterMenu();
    }
  });
}

function closeFilterMenu(e) {
  $("#filter-menu").toggle();
  $("body").off("click");
}

function filterOptionHTML(option, active) {
  return `
  <div onclick='changeFilter(event)' class='filter-option ${
    active ? "active-filter" : ""
  }'><span>${option}</span></div>
  `;
}

let filters = { caught: "Any", donated: "Any" };

function changeFilter(e) {
  e.stopPropagation();
  let target = $(e.target).closest(".filter-option");
  if ($(target).hasClass("active-filter")) {
    return;
  }
  let options = $(target).closest(".filter-options");
  let currentActive = $(options).children(".active-filter")[0];
  $(currentActive).removeClass("active-filter");
  $(target).addClass("active-filter");
  let optionText = $(target).children("span").text();
  let attr = $(options).attr("data-attr-name");

  $(".item-container").removeClass("display-hidden");
  filters[attr] = optionText;
  updateVisibilityFromFilters();
}

function updateVisibilityFromFilters() {
  $(".item-container").addClass("display-hidden");
  ids = Object.keys(dataByType[currentCritterTabType]);

  for (let attr in filters) {
    optionText = filters[attr];

    if (optionText === "Any") {
      continue;
    }
    ids = ids.filter(
      (k) =>
        dataByType[currentCritterTabType][k][attr] ===
        (optionText === "Yes" ? 1 : 0)
    );
  }

  ids = ids.map((x) => "#" + x);
  $(ids.join(", ")).removeClass("display-hidden");
}
