export function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1];
}

export function setCookie(name, value) {
  document.cookie = `${name}=${value};same-site=strict`;
}

export function deleteCookie(name) {
  document.cookie = `${name}=;max-age=0`;
}

// Just for dev purposes, allows easy use via the console
window.deleteCookie = deleteCookie;
