/// <reference lib="webworker" />

import { clientsClaim } from "workbox-core"
import { ExpirationPlugin } from "workbox-expiration"
import { createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching"
import { registerRoute } from "workbox-routing"
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies"

declare const self: ServiceWorkerGlobalScope

clientsClaim()

precacheAndRoute(self.__WB_MANIFEST)

// Serve the app shell for any same-origin navigation that isn't a request
// for a build asset, so client-side routes resolve while offline.
const fileExtensionRegexp = /\/[^/?]+\.[^/]+$/
registerRoute(
  ({ request, url }) => {
    if (request.mode !== "navigate") return false
    if (url.pathname.startsWith("/_")) return false
    if (url.pathname.match(fileExtensionRegexp)) return false
    return true
  },
  createHandlerBoundToURL(`${process.env.PUBLIC_URL}/index.html`),
)

registerRoute(
  ({ url }) =>
    url.origin === self.location.origin &&
    /\.(png|jpe?g|webp|gif|svg)$/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [new ExpirationPlugin({ maxEntries: 50 })],
  }),
)

registerRoute(
  ({ url }) => url.origin === "https://fonts.googleapis.com",
  new StaleWhileRevalidate({ cacheName: "google-fonts-stylesheets" }),
)

registerRoute(
  ({ url }) => url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: "google-fonts-webfonts",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365,
      }),
    ],
  }),
)

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
