import Marks from "./Marks";
import { getDict } from "@/lib/dictionary";
import { minuteLabel } from "@/lib/events";

// Хронология матча: голы, карточки, замены
export default function MatchEvents({ events, homeId, lang }) {
  const t = getDict(lang);
  if (!events.length) return <p className="muted pad">{t.noEvents}</p>;

  return (
    <ul className="events">
      {events.map((e, i) => {
        const side = e.teamId === homeId ? "home" : "away";
        return (
          <li key={i} className={`ev ${side}`}>
            <span className="ev-min">{minuteLabel(e.minute, e.injury)}</span>
            <span className="ev-body">
              {e.type === "sub" ? (
                <>
                  <span className="mark in">↑</span> {e.inName}{" "}
                  <span className="mark out">↓</span> {e.outName}
                </>
              ) : (
                <>
                  <Marks marks={[{ kind: e.kind }]} /> {e.name}
                  {e.pen ? <em> ({t.penaltyShort})</em> : null}
                  {e.kind === "owngoal" ? <em> ({t.ownGoal})</em> : null}
                  {e.assist ? (
                    <em className="muted">
                      {" "}
                      · {t.assistShort}: {e.assist}
                    </em>
                  ) : null}
                </>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
