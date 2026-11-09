export default function manifest() {
  return {
    name: "Футбол Топ-5",
    short_name: "Футбол",
    description: "Таблицы, результаты и бомбардиры топ-5 лиг и Лиги чемпионов",
    start_url: "/ru",
    display: "standalone",
    background_color: "#0b0c0d",
    theme_color: "#00b96b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
