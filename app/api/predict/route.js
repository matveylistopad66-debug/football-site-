import { savePrediction, UID_RE } from "@/lib/contest";
import { getMatchesWindow, getMatch } from "@/lib/api";
import { LEAGUES } from "@/lib/leagues";

export const dynamic = "force-dynamic";

// Сохранение прогноза на счёт матча (только до его начала)
export async function POST(req) {
  try {
    const b = await req.json();
    const matchId = Number(b?.matchId);
    const h = Number(b?.home);
    const a = Number(b?.away);
    const okScore = (n) => Number.isInteger(n) && n >= 0 && n <= 20;
    if (!UID_RE.test(b?.uid ?? "") || !Number.isInteger(matchId) || !okScore(h) || !okScore(a)) {
      return Response.json({ error: "bad_request" }, { status: 400 });
    }

    // Матч берём у API, а не из запроса посетителя: так время начала подделать нельзя
    let m = (await getMatchesWindow()).matches?.find((x) => x.id === matchId);
    if (!m) m = (await getMatch(matchId)).match;
    if (!m || !LEAGUES.some((l) => l.code === m.competition?.code)) {
      return Response.json({ error: "no_match" }, { status: 404 });
    }
    const open = ["SCHEDULED", "TIMED"].includes(m.status) && Date.parse(m.utcDate) > Date.now();
    if (!open) return Response.json({ error: "closed" }, { status: 400 });

    const saved = await savePrediction(b.uid, m, h, a);
    if (!saved) return Response.json({ error: "not_registered" }, { status: 404 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
