import { notFound } from "next/navigation";
import StandingsTable from "@/components/StandingsTable";
import MatchList from "@/components/MatchList";
import ScorersTable from "@/components/ScorersTable";
import { getDict } from "@/lib/dictionary";
import { getLeague } from "@/lib/leagues";
import { getStandings, getMatches, getScorers } from "@/lib/api";

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

  const [standings, matches, scorers] = await Promise.all([
    getStandings(league.code),
    getMatches(league.code),
    getScorers(league.code),
  ]);
  const demo = standings.demo || matches.demo || scorers.demo;
  const error = standings.error || matches.error || scorers.error;

  return (
    <>
      <h1>
        {league.flag} {league.name[lang]}
      </h1>
      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}

      <h2>{t.standings}</h2>
      <StandingsTable table={standings.table} lang={lang} />

      <h2>{t.matches}</h2>
      <MatchList matches={matches.matches} lang={lang} />

      <h2>{t.scorers}</h2>
      <ScorersTable scorers={scorers.scorers} lang={lang} />
    </>
  );
}
