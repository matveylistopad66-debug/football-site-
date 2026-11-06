import { getDict } from "@/lib/dictionary";

const LIVE = ["IN_PLAY", "PAUSED"];

function formatDate(iso, lang) {
  return new Date(iso).toLocaleString(lang === "ru" ? "ru-RU" : "en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Minsk", // часовой пояс: поменяйте на свой, например "Europe/Moscow"
  });
}

function Crest({ team }) {
  if (!team.crest) return null;
  return <img src={team.crest} alt="" width="20" height="20" loading="lazy" />;
}

export default function MatchList({ matches, lang, emptyText }) {
  const t = getDict(lang);
  if (!matches.length) return <p className="muted">{emptyText ?? t.noData}</p>;

  const sorted = [...matches].sort(
    (a, b) => new Date(a.utcDate) - new Date(b.utcDate)
  );

  return (
    <ul className="matches">
      {sorted.map((m) => {
        const { home, away } = m.score?.fullTime ?? {};
        const hasScore = home !== null && home !== undefined;
        const live = LIVE.includes(m.status);
        return (
          <li key={m.id} className="match">
            <span className="match-date">
              {live ? <b className="live">{t.statusLive}</b> : formatDate(m.utcDate, lang)}
            </span>
            <span className="match-team right">
              <span>{m.homeTeam.shortName || m.homeTeam.name}</span>
              <Crest team={m.homeTeam} />
            </span>
            <span className="match-score">{hasScore ? `${home} : ${away}` : "–"}</span>
            <span className="match-team">
              <Crest team={m.awayTeam} />
              <span>{m.awayTeam.shortName || m.awayTeam.name}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
