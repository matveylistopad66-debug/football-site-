// Минимальный служебный файл: делает сайт устанавливаемым. Ничего не кеширует, данные всегда свежие.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
