import { DEMO_TABLE, DEMO_MATCHES, DEMO_SCORERS } from "./demo";
import { LEAGUES } from "./leagues";

const BASE = "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY;

// Данные кэшируются на 5 минут, чтобы не превышать бесплатный лимит (10 запросов в минуту).
const REVALIDATE_SECONDS = 300;

// Возвращает данные или null, если запрос не удался (неверный ключ, лимит, сеть).
async function call(path) {
  try {
    const res = await fetch(BASE + path, {
      headers: { "X-Auth-Token": KEY },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function isoDate(offsetDays = 0) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

// Во всех функциях: demo = true, если ключа нет; error = true, если ключ есть, но данные не пришли.

export async function getStandings(code) {
  if (!KEY) return { demo: true, table: DEMO_TABLE };
  const data = await call(`/competitions/${code}/standings`);
  const total = data?.standings?.find((s) => s.type === "TOTAL");
  if (!total) return { error: true, table: [] };
  return { table: total.table };
}

export async function getMatches(code) {
  if (!KEY) return { demo: true, matches: DEMO_MATCHES };
  // Окно: 5 дней назад и 4 дня вперёд (API не любит окна длиннее 10 дней)
  const data = await call(
    `/competitions/${code}/matches?dateFrom=${isoDate(-5)}&dateTo=${isoDate(4)}`
  );
  if (!data) return { error: true, matches: [] };
  return { matches: data.matches };
}

export async function getScorers(code) {
  if (!KEY) return { demo: true, scorers: DEMO_SCORERS };
  const data = await call(`/competitions/${code}/scorers?limit=15`);
  if (!data) return { error: true, scorers: [] };
  return { scorers: data.scorers };
}

export async function getTodayMatches() {
  if (!KEY) return { demo: true, matches: [] };
  const today = isoDate(0);
  const codes = LEAGUES.map((l) => l.code).join(",");
  const data = await call(
    `/matches?competitions=${codes}&dateFrom=${today}&dateTo=${today}`
  );
  if (!data) return { error: true, matches: [] };
  return { matches: data.matches };
}
