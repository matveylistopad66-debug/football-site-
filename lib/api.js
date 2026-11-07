import { DEMO_TABLE, DEMO_MATCHES, DEMO_SCORERS } from "./demo";
import { LEAGUES } from "./leagues";

const BASE = "https://api.football-data.org/v4";
const KEY = process.env.FOOTBALL_DATA_API_KEY;

// Как долго (в секундах) сайт хранит ответ API, прежде чем спросить снова.
// Бесплатный лимит football-data.org: 10 запросов в минуту, поэтому не делайте числа слишком маленькими.
const SLOW = 300; // таблицы, бомбардиры, клубы
const FAST = 120; // главная страница и страница матча

// Возвращает данные или null, если запрос не удался (неверный ключ, лимит, сеть).
async function call(path, revalidate = SLOW) {
  try {
    const res = await fetch(BASE + path, {
      headers: { "X-Auth-Token": KEY },
      next: { revalidate },
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

// Матчи пяти лиг на 9 дней (для переключателя дней на главной)
export async function getMatchesWindow() {
  if (!KEY) return { demo: true, matches: DEMO_MATCHES };
  const codes = LEAGUES.map((l) => l.code).join(",");
  const data = await call(
    `/matches?competitions=${codes}&dateFrom=${isoDate(-4)}&dateTo=${isoDate(4)}`,
    FAST
  );
  if (!data) return { error: true, matches: [] };
  return { matches: data.matches };
}

// Клуб: название, логотип, стадион, тренер, состав (если тариф отдаёт)
export async function getTeam(id) {
  if (!KEY) return { demo: true };
  const data = await call(`/teams/${id}`);
  if (!data?.id) return { error: true };
  return { team: data };
}

// Все матчи клуба в текущем сезоне (из них берём последние 5 и ближайшие)
export async function getTeamMatches(id) {
  if (!KEY) return { demo: true, matches: [] };
  const data = await call(`/teams/${id}/matches`);
  if (!data) return { error: true, matches: [] };
  return { matches: data.matches ?? [] };
}

// Один матч: счёт, составы, голы, карточки, замены (что отдаёт тариф)
export async function getMatch(id) {
  if (!KEY) return { demo: true };
  const data = await call(`/matches/${id}`, FAST);
  const match = data?.match ?? data;
  if (!match?.id) return { error: true };
  return { match };
}
