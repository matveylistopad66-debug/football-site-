import Link from "next/link";
import { notFound } from "next/navigation";
import Crest from "@/components/Crest";
import Lineups from "@/components/Lineups";
import MatchEvents from "@/components/MatchEvents";
import { getDict } from "@/lib/dictionary";
import { getMatch } from "@/lib/api";
import { buildEvents } from "@/lib/events";
import { formatDateTime } from "@/lib/format";

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return {};
  const res = await getMatch(id);
  if (!res.match) return {};
  const m = res.match;
  return { title: `${m.homeTeam?.shortName || m.homeTeam?.name} — ${m.awayTeam?.shortName || m.awayTeam?.name}` };
}

function HeroTeam({ team, lang }) {
  const inner = (
    <>
      <Crest team={team} size={56} />
      <strong>{team?.shortName || team?.name}</strong>
    </>
  );
  if (!team?.id) return <div className="hero-team">{inner}</div>;
  return (
    <Link href={`/${lang}/team/${team.id}`} className="hero-team">
      {inner}
    </Link>
  );
}

export default async function MatchPage({ params }) {
  const { lang, id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const t = getDict(lang);

  const res = await getMatch(id);
  if (res.demo) return <div className="notice">{t.demoNotice}</div>;
  if (!res.match) return <div className="notice">{t.errorNotice}</div>;

  const m = res.match;
  const { home, away } = m.score?.fullTime ?? {};
  const hasScore = home !== null && home !== undefined;
  const ht = m.score?.halfTime;
  const hasHt = ht && ht.home !== null && ht.home !== undefined;
  const live = ["IN_PLAY", "PAUSED"].includes(m.status);
  const events = buildEvents(m);

  return (
    <>
      <section className="match-hero">
        <div className="muted small">
          {m.competition?.name ? `${m.competition.name} · ` : ""}
          {formatDateTime(m.utcDate, lang)}
        </div>
        <div className="hero-row">
          <HeroTeam team={m.homeTeam} lang={lang} />
          <div className={"hero-score" + (live ? " is-live" : "")}>
            {hasScore ? `${home} : ${away}` : "–"}
          </div>
          <HeroTeam team={m.awayTeam} lang={lang} />
        </div>
        <div className="muted small">
          {live ? <b className="live">{t.statuses[m.status]}</b> : t.statuses[m.status] ?? m.status}
          {hasHt && m.status === "FINISHED" ? ` · ${t.halftime}: ${ht.home}:${ht.away}` : ""}
          {m.venue ? ` · ${m.venue}` : ""}
        </div>
      </section>

      <h2>{t.events}</h2>
      <MatchEvents events={events} homeId={m.homeTeam?.id} lang={lang} />

      <h2>{t.lineups}</h2>
      <Lineups match={m} events={events} lang={lang} />
    </>
  );
}
