import { LEAGUES } from "./leagues";
import { getStandings } from "./api";

// Список всех клубов топ-5 лиг (из таблиц; ответы кешируются) с данными строки таблицы
export async function getAllTeams(lang) {
  const domestic = LEAGUES.filter((l) => l.code !== "CL");
  const results = await Promise.all(domestic.map((l) => getStandings(l.code)));
  const byId = new Map();
  domestic.forEach((l, i) => {
    const table = results[i].table ?? [];
    for (const r of table) {
      if (r.team?.id) byId.set(r.team.id, { team: r.team, row: r, league: l, size: table.length });
    }
  });
  return { byId, demo: results.some((r) => r.demo), error: results.every((r) => r.error) };
}
