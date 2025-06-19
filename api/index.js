import { deleteCookie, getCookie, setCookie } from "../cookies.js";

class GAppCache {
  constructor(cacheName) {
    this._cachePromise = caches.open(cacheName);
  }

  _buildKey({ url, action, actionArgs }) {
    // The params are actually sent in the body, but we want to cache different
    // responses for different params, so add the params to the url to make a unique
    // cache key
    const params = new URLSearchParams({
      action,
      actionArgs: JSON.stringify(actionArgs),
    });
    return `${url}?${params}`;
  }

  async match({ url, action, actionArgs }) {
    const cacheKey = this._buildKey({ url, action, actionArgs });
    const cache = await this._cachePromise;
    const resp = await cache.match(cacheKey);
    if (resp) {
      console.log(
        `Fetched cached response`,
        { url, action, actionArgs },
        await resp.clone().json()
      );
    }
    return resp;
  }

  async put({ url, action, actionArgs }, response) {
    const cacheKey = this._buildKey({ url, action, actionArgs });
    const cache = await this._cachePromise;
    // Clone the response to prevent the body from being consumed on the original
    return cache.put(cacheKey, response.clone());
  }
}

// This is specifically for Google Apps Script web app deployments
export default function buildApi({ gAppDeploymentId, sessionCookieName, cacheName }) {
  // Don't bother using test deployments (url has 'dev' instead of 'exec'), because
  // they require sign-in even if deployment is configured to allow access to anyone
  const url = `https://script.google.com/macros/s/${gAppDeploymentId}/exec`;
  const cache = cacheName ? new GAppCache(cacheName) : undefined;

  return new Proxy(
    {},
    {
      get(target, prop, receiver) {
        const action = prop;
        return async (actionArgs = {}) => {
          let resp = await cache?.match({ url, action, actionArgs });

          if (!resp) {
            resp = await fetch(url, {
              method: "POST",
              body: JSON.stringify({
                session: getCookie(sessionCookieName),
                action,
                actionArgs,
              }),
            });
            await cache?.put({ url, action, actionArgs }, resp);
          }

          const respJson = await resp.json();
          if (action === "login") {
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
