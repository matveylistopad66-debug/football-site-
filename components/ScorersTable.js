import Link from "next/link";
import Crest from "./Crest";
import { getDict } from "@/lib/dictionary";

export default function ScorersTable({ scorers, lang }) {
  const t = getDict(lang);
  if (!scorers || !scorers.length) return <p className="muted pad">{t.noData}</p>;

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
              <td className="left">
                <Link href={`/${lang}/team/${s.team.id}`} className="team">
                  <Crest team={s.team} />
                  <span>{s.team.shortName || s.team.name}</span>
                </Link>
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
