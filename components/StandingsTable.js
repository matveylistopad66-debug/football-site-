import Link from "next/link";
import Crest from "./Crest";
import { getDict } from "@/lib/dictionary";

// highlightId: id клуба, строку которого нужно выделить
export default function StandingsTable({ table, lang, highlightId }) {
  const t = getDict(lang);
  if (!table || !table.length) return <p className="muted pad">{t.noData}</p>;

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
            <tr
              key={row.team.id ?? row.team.name}
              className={row.team.id === highlightId ? "row-hl" : ""}
            >
              <td>{row.position}</td>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
