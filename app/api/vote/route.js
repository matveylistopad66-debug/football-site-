import { getStore } from "@netlify/blobs";
import { UID_RE } from "@/lib/contest";
import { getMatchesWindow, getMatch } from "@/lib/api";
import { LEAGUES } from "@/lib/leagues";

export const dynamic = "force-dynamic";

const store = () => getStore({ name: "votes", consistency: "strong" });
const countsKey = (id) => `counts/${id}`;
const voteKey = (id, uid) => `v/${id}/${uid}`;
const EMPTY = { h: 0, d: 0, a: 0 };

async function readCounts(s, id) {
  const raw = await s.get(countsKey(id));
  return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
}

// Прибавляет голос с повторной попыткой, если кто-то голосует одновременно
async function addVote(s, id, choice) {
  for (let i = 0; i < 4; i++) {
    const entry = await s.getWithMetadata(countsKey(id));
    const cur = entry ? { ...EMPTY, ...JSON.parse(entry.data) } : { ...EMPTY };
    cur[choice]++;
    const body = JSON.stringify(cur);
    const res = entry
      ? await s.set(countsKey(id), body, { onlyIfMatch: entry.etag })
      : await s.set(countsKey(id), body, { onlyIfNew: true });
    if (res?.modified !== false) return cur;
  }
  throw new Error("busy");
}

export async function GET(req) {
  try {
    const u = new URL(req.url);
    const id = Number(u.searchParams.get("matchId"));
    const uid = u.searchParams.get("uid") ?? "";
    if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "bad_request" }, { status: 400 });
    const s = store();
    const counts = await readCounts(s, id);
    let mine = null;
    if (UID_RE.test(uid)) mine = (await s.get(voteKey(id, uid))) ?? null;
    return Response.json({ counts, mine });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    const id = Number(b?.matchId);
    const choice = b?.choice;
    if (!UID_RE.test(b?.uid ?? "") || !Number.isInteger(id) || !["h", "d", "a"].includes(choice)) {
      return Response.json({ error: "bad_request" }, { status: 400 });
    }
    // Время начала берём у API, а не из запроса
    let m = (await getMatchesWindow()).matches?.find((x) => x.id === id);
    if (!m) m = (await getMatch(id)).match;
    if (!m || !LEAGUES.some((l) => l.code === m.competition?.code)) {
      return Response.json({ error: "no_match" }, { status: 404 });
    }
    const open = ["SCHEDULED", "TIMED"].includes(m.status) && Date.parse(m.utcDate) > Date.now();
    if (!open) return Response.json({ error: "closed" }, { status: 400 });

    const s = store();
    const first = await s.set(voteKey(id, b.uid), choice, { onlyIfNew: true });
    if (first?.modified === false) {
      return Response.json({ error: "already" }, { status: 409 });
    }
    const counts = await addVote(s, id, choice);
    return Response.json({ counts, mine: choice });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
