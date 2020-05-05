function loadLogin() {
  $("body").html(
    `
    <div id='login-form'>
      <input id='username' placeholder='username'></input><br/>
      <input id='password' type='password' placeholder='password'></input>
      <button id='login-submit' onclick='login()'>Log in</button>
    </div>
  `
  );
  listenToEnter();
}

function listenToEnter() {
  $("#password").keypress((e) => {
    if (e.keyCode === 13) {
      if (!$("#login-submit").prop("disabled")) {
        login();
      }
    }
  });
}

function login() {
  username = $("#username").val();
  $("#unauthorized").remove();
  $("#login-submit").prop("disabled", true);
  $.ajax({
    method: "POST",
    url: URL,
    dataType: "json",
    data: JSON.stringify({
      action: "login",
      actionArgs: [username, $("#password").val()],
    }),
    success: wrapWithErrorCheck(function (data, textStatus, jqXHR) {
      setCookie("session", data.session, data.expiresAt);
      setCookie("username", username, data.expiresAt);
      session = data.session;
      $("body").html(`
        <div class="menu">
          <div
            id="context-menu-icon"
            onclick="$('#context-menu').toggleClass('display-hidden')"
          >
            <div id="context-menu" class="display-hidden">
              <div class="context-menu-row" onclick="clearCookies(); loadLogin()">
                Log Out
              </div>
            </div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="active-menu-item" onclick="switchMainContent(event, 'home')">
            <img src="images/home.png" /><span>Home</span>
          </div>
          <div onclick="switchMainContent(event, 'critters')">
            <img src="images/net.png" /><span>Critters</span>
          </div>
        </div>
        <div id="main-content"></div>
      `);
      loadHome();
    }),
    error: function (jqXHR, textStatus, errorString) {
      if (errorString === "Error: Incorrect username/password") {
        appendUnauthorized();
      }
      console.log("login error", textStatus, errorString);
      $("#login-submit").prop("disabled", false);
    },
  });
}

function appendUnauthorized() {
  $("#login-form").append(
    '<div id="unauthorized">Incorrect username/password</div>'
  );
}
