import Link from "next/link";
import { notFound } from "next/navigation";
import Crest from "@/components/Crest";
import Lineups from "@/components/Lineups";
import MatchEvents from "@/components/MatchEvents";
import MatchTabs from "@/components/MatchTabs";
import ContestPanel from "@/components/ContestPanel";
import StandingsTable from "@/components/StandingsTable";
import { getDict } from "@/lib/dictionary";
import { getMatch, getStandings } from "@/lib/api";
import { buildEvents } from "@/lib/events";
import { formatDateTime } from "@/lib/format";
import { LEAGUES } from "@/lib/leagues";
import { slimMatch } from "@/lib/slim";
import { zonesFor } from "@/lib/zones";

export const revalidate = 120;

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return {};
  const res = await getMatch(id);
  if (!res.match) return {};
  const m = res.match;
  return {
    title: `${m.homeTeam?.shortName || m.homeTeam?.name} — ${m.awayTeam?.shortName || m.awayTeam?.name}`,
  };
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

import AutoRefresh from "@/components/AutoRefresh";
import ShareButtons from "@/components/ShareButtons";
import VoteBox from "@/components/VoteBox";

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

  // Таблица турнира с выделением обеих команд
  const code = m.competition?.code;
  let tableNode = <p className="muted pad">{t.noTable}</p>;
  if (LEAGUES.some((l) => l.code === code)) {
    const st = await getStandings(code);
    if (st.table?.length) {
      tableNode = (
        <StandingsTable
          table={st.table}
          lang={lang}
          highlightIds={[m.homeTeam?.id, m.awayTeam?.id]}
          zones={zonesFor(code, st.table.length)}
        />
      );
    }
  }

  const contestLabels = {
    loading: t.loading,
    noStorage: t.contestNoStorage,
    unavailable: t.contestUnavailable,
    joinText: t.contestJoinText,
    nickPlaceholder: t.nickPlaceholder,
    join: t.join,
    nickTaken: t.nickTaken,
    nickBad: t.nickBad,
    nickNote: t.nickNote,
    you: t.you,
    pts: t.pts,
    noOpen: t.noOpenMatches,
    save: t.save,
    saved: t.saved,
    saveError: t.saveError,
    fillScore: t.fillScore,
    closed: t.predClosed,
    noPred: t.noPred,
    waiting: t.waitingResult,
  };

  const tabs = [
    { id: "events", label: t.tabEvents, content: <MatchEvents events={events} homeId={m.homeTeam?.id} lang={lang} /> },
    { id: "lineups", label: t.tabLineups, content: <Lineups match={m} events={events} lang={lang} /> },
    { id: "table", label: t.tabTable, content: tableNode },
    {
      id: "predict",
      label: t.tabPredict,
      content: (
        <>
          <ContestPanel lang={lang} matches={[slimMatch(m)]} labels={contestLabels} />
          <p>
            <Link href={`/${lang}/contest`} className="more">
              {t.goContest} →
            </Link>
          </p>
        </>
      ),
    },
  ];

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

      <AutoRefresh active={live} label={t.autoUpdate} />

      <ShareButtons
        title={`${m.homeTeam?.shortName || m.homeTeam?.name} — ${m.awayTeam?.shortName || m.awayTeam?.name}`}
        startIso={m.utcDate}
        showCalendar={["SCHEDULED", "TIMED"].includes(m.status)}
        labels={{ share: t.share, calendar: t.addCalendar, copied: t.linkCopied }}
      />

      {LEAGUES.some((l) => l.code === code) && (
        <VoteBox
          matchId={m.id}
          open={["SCHEDULED", "TIMED"].includes(m.status) && Date.parse(m.utcDate) > Date.now()}
          labels={{
            title: t.voteTitle,
            home: t.voteHome,
            draw: t.voteDraw,
            away: t.voteAway,
            count: t.voteCount,
            thanks: t.voteThanks,
            error: t.voteError,
          }}
        />
      )}

      <MatchTabs tabs={tabs} />
    </>
  );
}
