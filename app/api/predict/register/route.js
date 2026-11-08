import { registerUser, UID_RE } from "@/lib/contest";

export const dynamic = "force-dynamic";

// Регистрация никнейма для конкурса прогнозов
export async function POST(req) {
  try {
    const body = await req.json();
    if (!UID_RE.test(body?.uid ?? "")) {
      return Response.json({ error: "bad_uid" }, { status: 400 });
    }
    const res = await registerUser(body.uid, body.name);
    if (res.error) {
      return Response.json(res, { status: res.error === "name_taken" ? 409 : 400 });
    }
    return Response.json(res);
  } catch {
    return Response.json({ error: "unavailable" }, { status: 503 });
  }
}
