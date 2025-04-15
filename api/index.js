import { deleteCookie, getCookie, setCookie } from "../cookies.js";

// This is specifically for Google Apps Script web app deployments
export default function buildApi({ gAppDeploymentId, sessionCookieName }) {
  // Don't bother using test deployments (url has 'dev' instead of 'exec'), because
  // they require sign-in even if deployment is configured to allow access to anyone
  const url = `https://script.google.com/macros/s/${gAppDeploymentId}/exec`;
  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        return async (actionArgs = {}) => {
          const resp = await fetch(url, {
            method: "POST",
            body: JSON.stringify({
              session: getCookie(sessionCookieName),
              action: prop,
              actionArgs,
            }),
          });
          const respJson = await resp.json();
          if (prop === "login") {
            if (!respJson.session) {
              console.log(respJson);
            } else {
              setCookie(sessionCookieName, respJson.session);

              if (window.history.state?.originalUrl) {
                location.href = window.history.state.originalUrl;
                return;
              }

              // If the login page was visited directly instead of being redirected to,
              // there won't be an `originalUrl`. Attempt to redirect to the app's home
              // page by removing a trailing "/login" from the url
              if (location.href.endsWith("/login")) {
                location.href = location.href.replace(/\/login$/, "");
                return;
              }

              console.warn("Login successful, but not sure where to redirect to");
            }
          }

          if (respJson.error === "Unauthorized") {
            deleteCookie(sessionCookieName);
            return window.location.reload();
          }
          return respJson;
        };
      },
    }
  );
}
