import { getUser, summarize, UID_RE } from "@/lib/contest";

export const dynamic = "force-dynamic";

// Данные посетителя: никнейм, его прогнозы и очки
export async function GET(req) {
  try {
    const uid = new URL(req.url).searchParams.get("uid") ?? "";
    if (!UID_RE.test(uid)) return Response.json({ error: "bad_uid" }, { status: 400 });
    const doc = await getUser(uid);
    if (!doc) return Response.json({ exists: false });
    const { total } = summarize(doc);
    return Response.json({ exists: true, name: doc.name, total, preds: doc.preds ?? {} });
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
