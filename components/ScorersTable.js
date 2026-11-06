import { getDict } from "@/lib/dictionary";

export default function ScorersTable({ scorers, lang }) {
  const t = getDict(lang);
  if (!scorers.length) return <p className="muted">{t.noData}</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th className="left">{t.player}</th>
            <th className="left">{t.team}</th>
            <th>{t.games}</th>
            <th>{t.goals}</th>
            <th>{t.assists}</th>
            <th>{t.penalties}</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((s, i) => (
            <tr key={`${s.player.name}-${i}`}>
              <td>{i + 1}</td>
              <td className="left">{s.player.name}</td>
              <td className="left team">
                {s.team.crest && (
                  <img src={s.team.crest} alt="" width="20" height="20" loading="lazy" />
                )}
                <span>{s.team.shortName || s.team.name}</span>
              </td>
              <td>{s.playedMatches ?? "–"}</td>
              <td>
                <strong>{s.goals ?? 0}</strong>
              </td>
              <td>{s.assists ?? 0}</td>
              <td>{s.penalties ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
