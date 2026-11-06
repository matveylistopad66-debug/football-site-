import { getDict } from "@/lib/dictionary";

export default function StandingsTable({ table, lang }) {
  const t = getDict(lang);
  if (!table.length) return <p className="muted">{t.noData}</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th className="left">{t.team}</th>
            <th>{t.played}</th>
            <th>{t.won}</th>
            <th>{t.draw}</th>
            <th>{t.lost}</th>
            <th>{t.goals}</th>
            <th>{t.gd}</th>
            <th>{t.points}</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row) => (
            <tr key={row.team.name}>
              <td>{row.position}</td>
              <td className="left team">
                {row.team.crest && (
                  <img src={row.team.crest} alt="" width="20" height="20" loading="lazy" />
                )}
                <span>{row.team.shortName || row.team.name}</span>
              </td>
              <td>{row.playedGames}</td>
              <td>{row.won}</td>
              <td>{row.draw}</td>
              <td>{row.lost}</td>
              <td>
                {row.goalsFor}:{row.goalsAgainst}
              </td>
              <td>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
              <td>
                <strong>{row.points}</strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
