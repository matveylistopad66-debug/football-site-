export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.FOOTBALL_DATA_API_KEY;
  if (!key) {
    return Response.json({ keyPresent: false });
  }
  try {
    const res = await fetch(
      "https://api.football-data.org/v4/competitions/PL/standings",
      { headers: { "X-Auth-Token": key }, cache: "no-store" }
    );
    const text = await res.text();
    return Response.json({
      keyPresent: true,
      keyLength: key.length,
      status: res.status,
      answer: text.slice(0, 300),
    });
  } catch (e) {
    return Response.json({ keyPresent: true, keyLength: key.length, networkError: String(e) });
  }
}
