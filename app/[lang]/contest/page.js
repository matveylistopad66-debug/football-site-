import ContestPanel from "@/components/ContestPanel";
import { getDict } from "@/lib/dictionary";
import { getMatchesWindow, getMatch } from "@/lib/api";
import { buildLeaderboard, resultsFromMatches } from "@/lib/contest";
import { slimMatch } from "@/lib/slim";

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).contestTitle };
}

export default async function ContestPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);

  const { matches } = await getMatchesWindow();
  const now = Date.now();
  const open = matches
    .filter((m) => ["SCHEDULED", "TIMED"].includes(m.status) && Date.parse(m.utcDate) > now)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(0, 20)
    .map(slimMatch);

  // Таблица лидеров: если хранилище недоступно, показываем сообщение, остальное работает
  let rows = null;
  try {
    const results = resultsFromMatches(matches);
    rows = await buildLeaderboard(results, async (ids) => {
      const map = new Map();
      for (const id of ids) {
        const r = await getMatch(id);
        const found = resultsFromMatches(r.match ? [r.match] : []);
        for (const [k, v] of found) map.set(k, v);
      }
      return map;
    });
  } catch {
    rows = null;
  }

  const labels = {
    loading: t.loading,
    noStorage: t.contestNoStorage,
    unavailable: t.contestUnavailable,
    joinText: t.contestJoinText,
    nickPlaceholder: t.nickPlaceholder,
    join: t.join,
    nickTaken: t.nickTaken,
    nickBad: t.nickBad,
    nickNote: t.nickNote,
    you: t.you,
    pts: t.pts,
    noOpen: t.noOpenMatches,
    save: t.save,
    saved: t.saved,
    saveError: t.saveError,
    fillScore: t.fillScore,
    closed: t.predClosed,
    noPred: t.noPred,
    waiting: t.waitingResult,
  };

  return (
    <>
      <h1>🏆 {t.contestTitle}</h1>
      <p className="muted">{t.contestRules}</p>

      <h2>{t.openMatches}</h2>
      <ContestPanel lang={lang} matches={open} labels={labels} />

      <h2>{t.leaderboard}</h2>
      {rows === null ? (
        <div className="notice">{t.contestUnavailable}</div>
      ) : rows.length === 0 ? (
        <p className="muted pad">{t.noPlayers}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th className="left">{t.nickname}</th>
                <th>{t.pts}</th>
                <th>{t.exactShort}</th>
                <th>{t.playedShort}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.name}-${i}`}>
                  <td>{i + 1}</td>
                  <td className="left">{r.name}</td>
                  <td>
                    <strong>{r.total}</strong>
                  </td>
                  <td>{r.exact}</td>
                  <td>{r.played}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
