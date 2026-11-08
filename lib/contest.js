// КОНКУРС ПРОГНОЗОВ: хранение в Netlify Blobs (встроенное хранилище Netlify, отдельной регистрации не нужно).
// Только для сервера. Если хранилище недоступно, функции выбрасывают ошибку, а вызывающий код её ловит.
import { getStore } from "@netlify/blobs";

const store = () => getStore({ name: "contest", consistency: "strong" });

export const UID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Если результат матча так и не нашёлся за столько дней, прогноз аннулируется (0 очков)
const VOID_MS = 14 * 24 * 3600 * 1000;

const userKey = (uid) => `users/${uid}`;
const nameKey = (name) => `names/${encodeURIComponent(name.toLowerCase())}`;

export function cleanName(raw) {
  const s = String(raw ?? "")
    .replace(/[\u0000-\u001f\u007f<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return s.length >= 2 && s.length <= 20 ? s : null;
}

export async function getUser(uid) {
  const raw = await store().get(userKey(uid));
  return raw ? JSON.parse(raw) : null;
}

// Безопасное обновление: если кто-то изменил запись одновременно, пробуем заново
async function updateUser(uid, mutate) {
  const s = store();
  for (let i = 0; i < 4; i++) {
    const entry = await s.getWithMetadata(userKey(uid));
    const cur = entry ? JSON.parse(entry.data) : null;
    const next = mutate(cur);
    if (!next) return cur;
    const body = JSON.stringify(next);
    const res = entry
      ? await s.set(userKey(uid), body, { onlyIfMatch: entry.etag })
      : await s.set(userKey(uid), body, { onlyIfNew: true });
    if (res?.modified !== false) return next;
  }
  throw new Error("conflict");
}

export async function registerUser(uid, rawName) {
  const name = cleanName(rawName);
  if (!name) return { error: "bad_name" };
  const existing = await getUser(uid);
  if (existing) return { ok: true, name: existing.name };

  const s = store();
  const nk = nameKey(name);
  const res = await s.set(nk, uid, { onlyIfNew: true });
  if (res?.modified === false) {
    const owner = await s.get(nk);
    if (owner !== uid) return { error: "name_taken" };
  }
  await updateUser(uid, (cur) => cur ?? { name, created: Date.now(), preds: {} });
  return { ok: true, name };
}

export async function savePrediction(uid, match, h, a) {
  const saved = await updateUser(uid, (cur) => {
    if (!cur) return null;
    return {
      ...cur,
      preds: {
        ...cur.preds,
        [match.id]: { h, a, ts: Date.now(), ko: Date.parse(match.utcDate) },
      },
    };
  });
  return saved;
}

export function summarize(doc) {
  let total = 0;
  let exact = 0;
  let played = 0;
  for (const p of Object.values(doc.preds ?? {})) {
    if (p.pts !== undefined) {
      total += p.pts;
      played += 1;
      if (p.exact) exact += 1;
    }
  }
  return { name: doc.name, total, exact, played };
}

// Очки: точный счёт = 3, верный исход (победа или ничья) = 1
export function scorePrediction(p, res) {
  if (p.h === res.h && p.a === res.a) return { pts: 3, exact: true };
  return Math.sign(p.h - p.a) === Math.sign(res.h - res.a)
    ? { pts: 1, exact: false }
    : { pts: 0, exact: false };
}

function settleDoc(cur, results, now) {
  if (!cur) return null;
  let changed = false;
  const preds = { ...cur.preds };
  for (const [id, p] of Object.entries(preds)) {
    if (p.pts !== undefined) continue;
    const r = results.get(Number(id));
    if (r) {
      preds[id] = { ...p, ...scorePrediction(p, r) };
      changed = true;
    } else if (now - p.ko > VOID_MS) {
      preds[id] = { ...p, pts: 0, exact: false, voided: true };
      changed = true;
    }
  }
  return changed ? { ...cur, preds } : null;
}

// results: Map(id матча -> {h, a}). resolveMissing(ids): async, возвращает Map для матчей, которых нет в results.
export async function buildLeaderboard(results, resolveMissing) {
  const s = store();
  const { blobs } = await s.list({ prefix: "users/" });
  const users = [];
  for (let i = 0; i < blobs.length; i += 20) {
    const chunk = blobs.slice(i, i + 20);
    const docs = await Promise.all(
      chunk.map(async (b) => {
        const raw = await s.get(b.key);
        return raw ? { uid: b.key.slice("users/".length), doc: JSON.parse(raw) } : null;
      })
    );
    users.push(...docs.filter(Boolean));
  }

  const now = Date.now();

  // Матчи, которые уже должны были закончиться, но результата для них ещё нет
  if (resolveMissing) {
    const missing = new Set();
    for (const u of users) {
      for (const [id, p] of Object.entries(u.doc.preds ?? {})) {
        if (p.pts === undefined && !results.has(Number(id)) && now - p.ko > 3 * 3600 * 1000) {
          missing.add(Number(id));
        }
      }
    }
    if (missing.size) {
      try {
        const extra = await resolveMissing([...missing].slice(0, 8));
        for (const [k, v] of extra) results.set(k, v);
      } catch {}
    }
  }

  const rows = [];
  for (const u of users) {
    let doc = u.doc;
    try {
      const updated = await updateUser(u.uid, (cur) => settleDoc(cur, results, now));
      if (updated) doc = updated;
    } catch {}
    rows.push(summarize(doc));
  }

  rows.sort(
    (a, b) =>
      b.total - a.total || b.exact - a.exact || a.played - b.played || a.name.localeCompare(b.name)
  );
  return rows.slice(0, 50);
}

// Результаты завершённых матчей из списка матчей API
export function resultsFromMatches(matches) {
  const map = new Map();
  for (const m of matches ?? []) {
    const h = m.score?.fullTime?.home;
    const a = m.score?.fullTime?.away;
    if (m.status === "FINISHED" && h !== null && h !== undefined && a !== null && a !== undefined) {
      map.set(m.id, { h, a });
    }
  }
  return map;
}
