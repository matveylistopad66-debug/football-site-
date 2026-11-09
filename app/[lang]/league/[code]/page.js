import { notFound } from "next/navigation";
import StandingsTable from "@/components/StandingsTable";
import MatchList from "@/components/MatchList";
import ScorersTable from "@/components/ScorersTable";
import MatchTabs from "@/components/MatchTabs";
import Matchdays from "@/components/Matchdays";
import Crest from "@/components/Crest";
import { slimMatch } from "@/lib/slim";
import { computeForm, computeSplit, computeFacts, groupByMatchday } from "@/lib/stats";
import { getDict } from "@/lib/dictionary";
import { getLeague } from "@/lib/leagues";
import { zonesFor } from "@/lib/zones";
import { getStandings, getMatches, getScorers, getSeasonMatches } from "@/lib/api";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang, code } = await params;
  const league = getLeague(code);
  if (!league) return {};
  const t = getDict(lang);
  return { title: `${league.name[lang]}: ${t.standings}` };
}

export default async function LeaguePage({ params }) {
  const { lang, code } = await params;
  const league = getLeague(code);
  if (!league) notFound();
  const t = getDict(lang);

  const [standings, matches, scorers, season] = await Promise.all([
    getStandings(league.code),
    getMatches(league.code),
    getScorers(league.code),
    getSeasonMatches(league.code),
  ]);
  const demo = standings.demo || matches.demo || scorers.demo;
  const error = standings.error || matches.error || scorers.error;

  const seasonMatches = season.matches ?? [];
  const form = Object.keys(computeForm(seasonMatches)).length ? computeForm(seasonMatches) : null;
  const zones = zonesFor(league.code, standings.table?.length ?? 0);
  const isCup = league.code === "CL";
  const homeTable = isCup ? [] : computeSplit(seasonMatches, "home");
  const awayTable = isCup ? [] : computeSplit(seasonMatches, "away");
  const facts = isCup ? [] : computeFacts(seasonMatches, standings.table);
  const { byDay, days, current } = groupByMatchday(seasonMatches);
  const slimByDay = {};
  for (const d of days) slimByDay[d] = byDay[d].map(slimMatch);

  const tableTabs = [
    {
      id: "total",
      label: t.viewTotal,
      content: <StandingsTable table={standings.table} lang={lang} zones={zones} form={form} />,
    },
  ];
  if (homeTable.length) {
    tableTabs.push({
      id: "home",
      label: t.viewHome,
      content: <StandingsTable table={homeTable} lang={lang} />,
    });
    tableTabs.push({
      id: "away",
      label: t.viewAway,
      content: <StandingsTable table={awayTable} lang={lang} />,
    });
  }

  const teamName = (tm) => tm?.shortName || tm?.name;

  return (
    <>
      <h1>
        {league.flag} {league.name[lang]}
      </h1>
      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}

      <h2>{t.standings}</h2>
      {tableTabs.length > 1 ? (
        <MatchTabs tabs={tableTabs} />
      ) : (
        tableTabs[0].content
      )}

      {facts.length > 0 && (
        <>
          <h2>{t.factsTitle}</h2>
          <div className="facts">
            {facts.map((f) => (
              <div key={f.key} className="fact">
                <span className="muted small">{t[f.key]}</span>
                <strong>{f.value}</strong>
                {f.team && (
                  <span className="fact-team">
                    <Crest team={f.team} size={16} /> {teamName(f.team)}
                  </span>
                )}
                {f.match && (
                  <span className="fact-team small">
                    {teamName(f.match.homeTeam)} — {teamName(f.match.awayTeam)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {days.length > 0 ? (
        <>
          <h2>{t.matchdayMatches}</h2>
          <Matchdays
            byDay={slimByDay}
            days={days}
            initial={current}
            lang={lang}
            labels={{ prev: t.prevDay, next: t.nextDay, matchday: t.matchday }}
          />
        </>
      ) : (
        <>
          <h2>{t.matches}</h2>
          <MatchList matches={matches.matches} lang={lang} />
        </>
      )}

      <h2>{t.scorers}</h2>
      <ScorersTable scorers={scorers.scorers} lang={lang} />
    </>
  );
}
