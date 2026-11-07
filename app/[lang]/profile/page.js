import ProfileClient from "@/components/ProfileClient";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import { getStandings } from "@/lib/api";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).profile };
}

export default async function ProfilePage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);

  // Список команд берём из таблиц всех лиг (дубли убираем)
  const results = await Promise.all(LEAGUES.map((l) => getStandings(l.code)));
  const seen = new Set();
  const teams = [];
  results.forEach((res, i) => {
    const league = LEAGUES[i];
    for (const row of res.table ?? []) {
      const tm = row.team;
      if (!tm?.id || seen.has(tm.id)) continue;
      seen.add(tm.id);
      teams.push({
        id: tm.id,
        name: tm.shortName || tm.name,
        crest: tm.crest ?? null,
        order: i,
        league: { code: league.code, name: league.name[lang] },
      });
    }
  });
  teams.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));

  const demo = results.some((r) => r.demo);
  const error = results.some((r) => r.error);

  const labels = {
    favTeams: t.favTeams,
    noFav: t.noFavYet,
    clear: t.clearAll,
    note: t.profileNote,
    search: t.searchTeams,
    noFound: t.noTeamsFound,
  };

  return (
    <>
      <h1>{t.profile}</h1>
      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}
      <ProfileClient lang={lang} teams={teams} labels={labels} />
    </>
  );
}
