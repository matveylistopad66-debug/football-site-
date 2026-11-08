import Link from "next/link";
import { notFound } from "next/navigation";
import Crest from "@/components/Crest";
import FollowButton from "@/components/FollowButton";
import MatchList from "@/components/MatchList";
import StandingsTable from "@/components/StandingsTable";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import { getTeam, getTeamMatches, getStandings } from "@/lib/api";
import { age, posGroup } from "@/lib/format";
import { zonesFor } from "@/lib/zones";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return {};
  const res = await getTeam(id);
  return res.team ? { title: res.team.name } : {};
}

// Результат матча для клуба: W / D / L или null
function resultFor(m, teamId) {
  const { home, away } = m.score?.fullTime ?? {};
  if (home === null || home === undefined || away === null || away === undefined) return null;
  const isHome = m.homeTeam?.id === teamId;
  const gf = isHome ? home : away;
  const ga = isHome ? away : home;
  return gf > ga ? "W" : gf < ga ? "L" : "D";
}

export default async function TeamPage({ params }) {
  const { lang, id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const teamId = Number(id);
  const t = getDict(lang);

  const [teamRes, matchesRes] = await Promise.all([getTeam(id), getTeamMatches(id)]);

  if (teamRes.demo) {
    return <div className="notice">{t.demoNotice}</div>;
  }
  if (!teamRes.team) {
    return <div className="notice">{t.errorNotice}</div>;
  }
  const team = teamRes.team;

  // Таблица лиги, в которой играет клуб
  const league = LEAGUES.find((l) =>
    (team.runningCompetitions ?? []).some((c) => c.code === l.code)
  );
  const standings = league ? await getStandings(league.code) : null;
  let miniTable = [];
  if (standings?.table?.length) {
    const idx = standings.table.findIndex((r) => r.team.id === teamId);
    if (idx >= 0) {
      const start = Math.max(0, Math.min(idx - 2, standings.table.length - 5));
      miniTable = standings.table.slice(start, start + 5);
    }
  }

  // Последние 5 матчей и ближайшие
  const all = matchesRes.matches ?? [];
  const finished = all
    .filter((m) => m.status === "FINISHED")
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  const last5 = finished.slice(-5);
  const upcoming = all
    .filter((m) => ["SCHEDULED", "TIMED", "IN_PLAY", "PAUSED"].includes(m.status))
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(0, 3);

  // Состав по позициям
  const labels = { GK: t.gk, DF: t.df, MF: t.mf, FW: t.fw, "": t.otherPos };
  const squad = team.squad ?? [];
  const groups = ["GK", "DF", "MF", "FW", ""]
    .map((g) => ({ g, players: squad.filter((p) => posGroup(p.position) === g) }))
    .filter((x) => x.players.length);

  const info = [
    team.venue && [t.venue, team.venue],
    team.founded && [t.founded, team.founded],
    team.clubColors && [t.colors, team.clubColors],
    team.coach?.name && [t.coach, team.coach.name],
  ].filter(Boolean);

  return (
    <>
      {matchesRes.error && <div className="notice">{t.errorNotice}</div>}

      <section className="hero-card">
        <Crest team={team} size={72} />
        <div>
          <h1>{team.name}</h1>
          {league && (
            <Link href={`/${lang}/league/${league.code}`} className="muted">
              {league.flag} {league.name[lang]}
            </Link>
          )}
        </div>
        <FollowButton
          team={{ id: teamId, name: team.shortName || team.name, crest: team.crest ?? null }}
          followLabel={t.follow}
          followingLabel={t.following}
        />
      </section>

      {info.length > 0 && (
        <dl className="info">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
          {team.website && (
            <div>
              <dt>{t.website}</dt>
              <dd>
                <a href={team.website} target="_blank" rel="noopener noreferrer">
                  {team.website.replace(/^https?:\/\//, "")}
                </a>
              </dd>
            </div>
          )}
        </dl>
      )}

      <h2>{t.lastMatches}</h2>
      {last5.length > 0 && (
        <div className="form">
          {last5.map((m) => {
            const r = resultFor(m, teamId);
            const letter = r === "W" ? t.won : r === "L" ? t.lost : t.draw;
            return (
              <Link key={m.id} href={`/${lang}/match/${m.id}`} className={`badge ${r ?? ""}`}>
                {letter}
              </Link>
            );
          })}
        </div>
      )}
      <MatchList matches={[...last5].reverse()} lang={lang} emptyText={t.noTeamMatches} />

      {upcoming.length > 0 && (
        <>
          <h2>{t.nextMatches}</h2>
          <MatchList matches={upcoming} lang={lang} />
        </>
      )}

      {miniTable.length > 0 && (
        <>
          <h2>{t.tablePosition}</h2>
          <StandingsTable
            table={miniTable}
            lang={lang}
            highlightId={teamId}
            zones={zonesFor(league.code, standings.table.length)}
          />
          <p>
            <Link href={`/${lang}/league/${league.code}`} className="more">
              {t.fullTable} →
            </Link>
          </p>
        </>
      )}

      <h2>{t.squad}</h2>
      {groups.length === 0 ? (
        <p className="muted pad">{t.noSquad}</p>
      ) : (
        groups.map(({ g, players }) => (
          <div key={g || "other"} className="table-wrap squad">
            <table>
              <thead>
                <tr>
                  <th className="left">{labels[g]}</th>
                  <th className="left">{t.nationality}</th>
                  <th>{t.age}</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id ?? p.name}>
                    <td className="left">{p.name}</td>
                    <td className="left muted">{p.nationality ?? "–"}</td>
                    <td>{age(p.dateOfBirth)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </>
  );
}
