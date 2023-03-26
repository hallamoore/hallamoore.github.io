function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

function setCookie(name, value) {
  document.cookie = `${name}=${value};same-site=strict`;
}

function deleteCookie(name) {
  document.cookie = `${name}=;max-age=0`;
}

export { getCookie, setCookie, deleteCookie };

window.deleteCookie = deleteCookie;
