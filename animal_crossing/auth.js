function getCookie() {
  if (document.cookie === "") {
    return;
  }
  let cookies = document.cookie.split(";");
  let prefix = "session=";
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(prefix)) {
      return cookie.substr(prefix.length);
    }
  }
}

function setCookie(value, expiresAt) {
  expiresAt = new Date(expiresAt);
  expiresAt = expiresAt.toUTCString();
  document.cookie = `session=${value};expires=${expiresAt}`;
}

function logout(postToServer = true) {
  let expiresAt = new Date();
  expiresAt = expiresAt.toUTCString();
  setCookie("", expiresAt);

  if (!postToServer) {
    // If the server told us the session was unauthorized, no need to ask the
    // server to remove the session.
    return;
  }

  $.ajax({
    method: "POST",
    url: URL,
    dataType: "json",
    data: JSON.stringify({
      session,
      action: "logout",
    }),
    success: wrapWithErrorCheck(function (data, textStatus, jqXHR) {
      // Do nothing, but still have function here so that it can be wrapped with error check
    }),
    error: function (jqXHR, textStatus, errorString) {
      console.log(textStatus, errorString);
      alert("Couldn't delete session on server");
    },
  });
}
