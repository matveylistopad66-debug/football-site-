import { TIMEZONE } from "./config";

const locale = (lang) => (lang === "ru" ? "ru-RU" : "en-GB");

export function formatTime(iso, lang) {
  return new Date(iso).toLocaleTimeString(locale(lang), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
}

export function formatDateTime(iso, lang) {
  return new Date(iso).toLocaleString(locale(lang), {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });
}

// Ключ дня вида "2026-11-07" в нашем часовом поясе
export function dayKey(iso) {
  return new Date(iso).toLocaleDateString("sv-SE", { timeZone: TIMEZONE });
}

export function todayKey() {
  return dayKey(new Date().toISOString());
}

export function addDays(key, n) {
  const d = new Date(key + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

// Подпись для кнопки дня: { top, bottom }
export function dayLabel(key, lang, t) {
  const today = todayKey();
  const d = new Date(key + "T12:00:00Z");
  let top;
  if (key === today) top = t.today;
  else if (key === addDays(today, -1)) top = t.yesterday;
  else if (key === addDays(today, 1)) top = t.tomorrow;
  else top = d.toLocaleDateString(locale(lang), { weekday: "short", timeZone: "UTC" });
  const bottom = d.toLocaleDateString(locale(lang), {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
  return { top, bottom };
}

export function age(dob) {
  if (!dob) return "–";
  return Math.floor((Date.now() - new Date(dob).getTime()) / 31557600000);
}

// Группа позиции игрока: GK / DF / MF / FW (или пусто)
export function posGroup(pos) {
  const p = (pos || "").toLowerCase();
  if (p.includes("keeper")) return "GK";
  if (p.includes("midfield")) return "MF";
  if (p.includes("back") || p.includes("defen")) return "DF";
  if (p.includes("wing") || p.includes("forward") || p.includes("striker") || p.includes("offen"))
    return "FW";
  return "";
}
