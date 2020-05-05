function getCookie(name) {
  if (document.cookie === "") {
    return;
  }
  let cookies = document.cookie.split(";");
  let prefix = `${name}=`;
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.startsWith(prefix)) {
      return cookie.substr(prefix.length);
    }
  }
}

function setCookie(name, value, expiresAt) {
  expiresAt = new Date(expiresAt);
  expiresAt = expiresAt.toUTCString();
  document.cookie = `${name}=${value};expires=${expiresAt}`;
}

function clearCookies() {
  let expiresAt = new Date();
  expiresAt = expiresAt.toUTCString();
  setCookie("session", "", expiresAt);
  setCookie("username", "", expiresAt);
}
