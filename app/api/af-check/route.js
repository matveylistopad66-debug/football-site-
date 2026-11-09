// Временная страница проверки бесплатного ключа API-Football. Ключ не показывается.
// После проверки эту папку (app/api/af-check) можно удалить.
export const dynamic = "force-dynamic";

const BASE = "https://v3.football.api-sports.io";

async function call(path, key) {
  try {
    const res = await fetch(BASE + path, { headers: { "x-apisports-key": key }, cache: "no-store" });
    const j = await res.json();
    return { http: res.status, errors: j.errors, results: j.results, response: j.response };
  } catch (e) {
    return { http: 0, errors: String(e) };
  }
}

export async function GET() {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return Response.json({ step0: "Нет переменной API_FOOTBALL_KEY в Netlify" });

  const out = {};
  const st = await call("/status", key);
  out.account = {
    http: st.http,
    errors: st.errors,
    plan: st.response?.subscription?.plan,
    requestsToday: st.response?.requests?.current,
    requestsLimit: st.response?.requests?.limit_day,
  };

  // Премьер-лига (id 39): сезоны 2025 (25/26) и 2026 (26/27)
  for (const season of [2026, 2025, 2024]) {
    const r = await call(`/fixtures?league=39&season=${season}&last=3`, key);
    out["season" + season] = {
      http: r.http,
      errors: r.errors,
      matches: r.results,
      example: r.response?.[0]
        ? `${r.response[0].teams.home.name} - ${r.response[0].teams.away.name}, ${r.response[0].fixture.date}`
        : null,
      fixtureId: r.response?.[0]?.fixture?.id,
    };
  }

  // Составы и события самого свежего найденного матча
  const fx = [2026, 2025, 2024].map((s) => out["season" + s].fixtureId).find(Boolean);
  if (fx) {
    const l = await call(`/fixtures/lineups?fixture=${fx}`, key);
    const e = await call(`/fixtures/events?fixture=${fx}`, key);
    out.lineups = { fixtureId: fx, http: l.http, errors: l.errors, teams: l.results };
    out.events = { http: e.http, errors: e.errors, count: e.results };
  }
  for (const k of Object.keys(out)) if (out[k] && typeof out[k] === "object") delete out[k].fixtureId;
  return Response.json(out);
}
