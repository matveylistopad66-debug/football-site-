import Link from "next/link";
import Crest from "./Crest";
import { getDict } from "@/lib/dictionary";

// highlightId / highlightIds: клуб(ы), строку которых нужно выделить
// zones: цветные зоны таблицы (см. lib/zones.js)
export default function StandingsTable({ table, lang, highlightId, highlightIds, zones = [] }) {
  const t = getDict(lang);
  if (!table || !table.length) return <p className="muted pad">{t.noData}</p>;

  const marked = new Set([...(highlightIds ?? []), highlightId].filter((x) => x != null));
  const zoneOf = (pos) => zones.find((z) => pos >= z.from && pos <= z.to);
  const legend = [];
  for (const z of zones) {
    if (!legend.some((x) => x.label === z.label)) legend.push(z);
  }

  return (
    <>
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
            {table.map((row) => {
              const z = zoneOf(row.position);
              return (
                <tr
                  key={row.team.id ?? row.team.name}
                  className={marked.has(row.team.id) ? "row-hl" : ""}
                >
                  <td className={z ? `zone z-${z.kind}` : ""}>{row.position}</td>
                  <td className="left">
                    <Link href={`/${lang}/team/${row.team.id}`} className="team">
                      <Crest team={row.team} />
                      <span>{row.team.shortName || row.team.name}</span>
                    </Link>
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
              );
            })}
          </tbody>
        </table>
      </div>
      {legend.length > 0 && (
        <ul className="legend">
          {legend.map((z) => (
            <li key={z.label}>
              <i className={`dot z-${z.kind}`} /> {t[z.label]}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
