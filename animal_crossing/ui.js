function openContextMenu(e) {
  $("#context-menu").css("left", $(".menu").width() + "px");
  $("#context-menu").toggle();
  $("body").click(() => {
    closeContextMenu();
  });
  e.stopPropagation();
}

function closeContextMenu() {
  $("#context-menu").toggle();
  $("body").off("click");
}
