import SearchBox from "@/components/SearchBox";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import { getAllTeams } from "@/lib/teams";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).searchTitle };
}

export default async function SearchPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { byId, demo, error } = await getAllTeams(lang);

  const teams = [...byId.values()]
    .map((x) => ({
      id: x.team.id,
      name: x.team.name,
      short: x.team.shortName,
      crest: x.team.crest ?? null,
      league: x.league.name[lang],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const leagues = LEAGUES.map((l) => ({ code: l.code, flag: l.flag, name: l.name[lang] }));

  return (
    <>
      <h1>🔍 {t.searchTitle}</h1>
      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}
      <SearchBox
        lang={lang}
        teams={teams}
        leagues={leagues}
        labels={{
          placeholder: t.searchPlaceholder,
          hint: t.searchHint,
          none: t.noResults,
          leagues: t.searchLeaguesTitle,
          teams: t.searchTeamsTitle,
        }}
      />
    </>
  );
}
