import Link from "next/link";
import Crest from "./Crest";
import { getDict } from "@/lib/dictionary";
import { formatDateTime, formatTime } from "@/lib/format";

const LIVE = ["IN_PLAY", "PAUSED"];

function TeamLink({ team, lang, right }) {
  const name = team?.shortName || team?.name || "?";
  const inner = right ? (
    <>
      <span>{name}</span>
      <Crest team={team} />
    </>
  ) : (
    <>
      <Crest team={team} />
      <span>{name}</span>
    </>
  );
  const cls = "match-team" + (right ? " right" : "");
  if (!team?.id) return <span className={cls}>{inner}</span>;
  return (
    <Link href={`/${lang}/team/${team.id}`} className={cls}>
      {inner}
    </Link>
  );
}

// Список матчей. Нажатие на клуб открывает страницу клуба, на счёт или время — страницу матча.
// timeOnly = true: в первой колонке только время (для списков одного дня).
export default function MatchList({ matches, lang, emptyText, timeOnly = false }) {
  const t = getDict(lang);
  if (!matches || !matches.length) {
    return <p className="muted pad">{emptyText ?? t.noData}</p>;
  }

  const sorted = [...matches].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  return (
    <ul className={"matches" + (timeOnly ? " timeonly" : "")}>
      {sorted.map((m) => {
        const { home, away } = m.score?.fullTime ?? {};
        const hasScore = home !== null && home !== undefined;
        const live = LIVE.includes(m.status);
        const href = `/${lang}/match/${m.id}`;

        let first;
        if (live) first = <b className="live">{t.statusLive}</b>;
        else if (m.status === "POSTPONED") first = t.pstShort;
        else if (m.status === "FINISHED" && timeOnly) first = t.ftShort;
        else first = timeOnly ? formatTime(m.utcDate, lang) : formatDateTime(m.utcDate, lang);

        return (
          <li key={m.id} className="match">
            <Link href={href} className="match-date">
              {first}
            </Link>
            <TeamLink team={m.homeTeam} lang={lang} right />
            <Link href={href} className={"match-score" + (live ? " is-live" : "")}>
              {hasScore ? `${home} : ${away}` : "–"}
            </Link>
            <TeamLink team={m.awayTeam} lang={lang} />
          </li>
        );
      })}
    </ul>
  );
}
