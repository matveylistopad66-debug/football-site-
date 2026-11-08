import Link from "next/link";
import Crest from "./Crest";
import Countdown from "./Countdown";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import { formatDateTime, formatTime, dayKey, todayKey } from "@/lib/format";

// Карточка «Матч дня» на главной
export default function MatchOfDay({ match, lang }) {
  const t = getDict(lang);
  const league = LEAGUES.find((l) => l.code === match.competition?.code);
  const sameDay = dayKey(match.utcDate) === todayKey();
  const timeLabel = sameDay ? formatTime(match.utcDate, lang) : formatDateTime(match.utcDate, lang);
  const { home, away } = match.score?.fullTime ?? {};

  const labels = {
    live: t.statusLive,
    finished: t.statuses.FINISHED,
    startsIn: t.startsIn,
    d: t.dayShort,
    h: t.hourShort,
    m: t.minShort,
  };

  return (
    <Link href={`/${lang}/match/${match.id}`} className="motd">
      <div className="motd-top">
        <span>⭐ {t.matchOfDay}</span>
        {league && (
          <span className="muted">
            {league.flag} {league.name[lang]}
          </span>
        )}
      </div>
      <div className="motd-row">
        <div className="motd-team">
          <Crest team={match.homeTeam} size={52} />
          <strong>{match.homeTeam?.shortName || match.homeTeam?.name}</strong>
        </div>
        <Countdown
          iso={match.utcDate}
          status={match.status}
          home={home ?? null}
          away={away ?? null}
          timeLabel={timeLabel}
          labels={labels}
        />
        <div className="motd-team">
          <Crest team={match.awayTeam} size={52} />
          <strong>{match.awayTeam?.shortName || match.awayTeam?.name}</strong>
        </div>
      </div>
    </Link>
  );
}
