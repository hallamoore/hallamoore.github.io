function setViewportCSSVars() {
  let vh = window.innerHeight / 100;
  let vw = window.innerWidth / 100;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  document.documentElement.style.setProperty("--vw", `${vw}px`);
}

function listenForResize() {
  $(window).resize(() => {
    setViewportCSSVars();
    $("#a").html(document.documentElement.clientHeight);
    $("#b").html(window.innerHeight);
    $("#c").html(document.documentElement.clientWidth);
    $("#d").html(window.innerWidth);
  });
}
