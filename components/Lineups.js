import Link from "next/link";
import Crest from "./Crest";
import Marks from "./Marks";
import { getDict } from "@/lib/dictionary";
import { marksByPlayer } from "@/lib/events";
import { posGroup } from "@/lib/format";

function PlayerList({ players, marks }) {
  return (
    <ul className="players">
      {players.map((p) => (
        <li key={p.id ?? p.name} className="pl">
          <span className="pl-num">{p.shirtNumber ?? ""}</span>
          <span className="pl-name">{p.name}</span>
          <span className="pl-pos">{posGroup(p.position)}</span>
          <Marks marks={marks.get(p.id)} />
        </li>
      ))}
    </ul>
  );
}

// Стартовые составы обеих команд с метками: гол, карточка, замена (с минутой)
export default function Lineups({ match, events, lang }) {
  const t = getDict(lang);
  const sides = [match.homeTeam, match.awayTeam];
  if (!sides.some((s) => s?.lineup?.length)) {
    return <p className="muted pad">{t.noLineups}</p>;
  }
  const marks = marksByPlayer(events);

  return (
    <div className="lineups">
      {sides.map((s, i) => (
        <div key={i} className="lineup">
          <div className="lineup-head">
            <Link href={`/${lang}/team/${s.id}`} className="team">
              <Crest team={s} size={24} />
              <strong>{s.shortName || s.name}</strong>
            </Link>
            {s.formation ? (
              <span className="muted">
                {t.formation}: {s.formation}
              </span>
            ) : null}
          </div>
          {s.coach?.name ? (
            <div className="muted small">
              {t.coach}: {s.coach.name}
            </div>
          ) : null}

          <h4>{t.startingXI}</h4>
          <PlayerList players={s.lineup ?? []} marks={marks} />

          {s.bench?.length ? (
            <>
              <h4>{t.bench}</h4>
              <PlayerList players={s.bench} marks={marks} />
            </>
          ) : null}
        </div>
      ))}
    </div>
  );
}
