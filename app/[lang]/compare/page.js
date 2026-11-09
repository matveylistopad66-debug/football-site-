import Link from "next/link";
import Crest from "@/components/Crest";
import MatchList from "@/components/MatchList";
import { getDict } from "@/lib/dictionary";
import { getTeamMatches } from "@/lib/api";
import { getAllTeams } from "@/lib/teams";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).compareTitle };
}

const per = (n, g) => (g ? (n / g).toFixed(2) : "–");

// Строки сравнения: lowerBetter = true, если меньшее число лучше
function buildRows(a, b, t) {
  const ra = a.row;
  const rb = b.row;
  const num = (x) => Number(x);
  return [
    { label: t.position, a: ra.position, b: rb.position, lowerBetter: true, skipIfDiffLeague: true },
    { label: t.points, a: ra.points, b: rb.points },
    { label: t.played, a: ra.playedGames, b: rb.playedGames, neutral: true },
    { label: t.won, a: ra.won, b: rb.won },
    { label: t.draw, a: ra.draw, b: rb.draw, neutral: true },
    { label: t.lost, a: ra.lost, b: rb.lost, lowerBetter: true },
    { label: t.ppg, a: per(ra.points, ra.playedGames), b: per(rb.points, rb.playedGames) },
    { label: t.gpg, a: per(ra.goalsFor, ra.playedGames), b: per(rb.goalsFor, rb.playedGames) },
    {
      label: t.cpg,
      a: per(ra.goalsAgainst, ra.playedGames),
      b: per(rb.goalsAgainst, rb.playedGames),
      lowerBetter: true,
    },
    { label: t.gd, a: ra.goalDifference, b: rb.goalDifference },
  ].map((r) => {
    let wa = false;
    let wb = false;
    if (!r.neutral && num(r.a) !== num(r.b) && !Number.isNaN(num(r.a)) && !Number.isNaN(num(r.b))) {
      const aBetter = r.lowerBetter ? num(r.a) < num(r.b) : num(r.a) > num(r.b);
      wa = aBetter;
      wb = !aBetter;
    }
    return { ...r, wa, wb };
  });
}

function last5(matches) {
  return (matches ?? [])
    .filter((m) => m.status === "FINISHED")
    .sort((x, y) => new Date(x.utcDate) - new Date(y.utcDate))
    .slice(-5)
    .reverse();
}

export default async function ComparePage({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);
  const { byId, demo, error } = await getAllTeams(lang);

  const idA = /^\d+$/.test(sp?.a ?? "") ? Number(sp.a) : null;
  const idB = /^\d+$/.test(sp?.b ?? "") ? Number(sp.b) : null;
  const A = idA ? byId.get(idA) : null;
  const B = idB ? byId.get(idB) : null;

  const options = [...byId.values()].sort((x, y) => x.team.name.localeCompare(y.team.name));
  const select = (name, value) => (
    <select name={name} defaultValue={value ?? ""} className="search">
      <option value="">{t.comparePick}</option>
      {options.map((o) => (
        <option key={o.team.id} value={o.team.id}>
          {o.team.shortName || o.team.name}
        </option>
      ))}
    </select>
  );

  let body = null;
  if (idA && idB && idA === idB) {
    body = <p className="muted pad">{t.compareSame}</p>;
  } else if (A && B) {
    const [ma, mb] = await Promise.all([getTeamMatches(A.team.id), getTeamMatches(B.team.id)]);
    const rows = buildRows(A, B, t);
    const sameLeague = A.league.code === B.league.code;
    body = (
      <>
        <div className="cmp-head">
          <Link href={`/${lang}/team/${A.team.id}`} className="hero-team">
            <Crest team={A.team} size={56} />
            <strong>{A.team.shortName || A.team.name}</strong>
          </Link>
          <span className="muted">VS</span>
          <Link href={`/${lang}/team/${B.team.id}`} className="hero-team">
            <Crest team={B.team} size={56} />
            <strong>{B.team.shortName || B.team.name}</strong>
          </Link>
        </div>
        <div className="table-wrap cmp">
          <table>
            <tbody>
              {rows
                .filter((r) => sameLeague || !r.skipIfDiffLeague)
                .map((r) => (
                  <tr key={r.label}>
                    <td className={r.wa ? "cmp-win" : ""}>{r.a}</td>
                    <td className="muted">{r.label}</td>
                    <td className={r.wb ? "cmp-win" : ""}>{r.b}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!sameLeague && (
          <p className="muted small">
            {A.league.flag} {A.league.name[lang]} · {B.league.flag} {B.league.name[lang]}
          </p>
        )}
        <h2>{A.team.shortName || A.team.name}: {t.lastMatches}</h2>
        <MatchList matches={last5(ma.matches)} lang={lang} emptyText={t.noTeamMatches} />
        <h2>{B.team.shortName || B.team.name}: {t.lastMatches}</h2>
        <MatchList matches={last5(mb.matches)} lang={lang} emptyText={t.noTeamMatches} />
      </>
    );
  } else if (idA || idB) {
    body = <div className="notice">{t.compareNoData}</div>;
  }

  return (
    <>
      <h1>⚖️ {t.compareTitle}</h1>
      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}
      <p className="muted">{t.compareHint}</p>
      <form method="get" className="cmp-form">
        {select("a", idA)}
        {select("b", idB)}
        <button type="submit" className="follow on">
          {t.compareBtn}
        </button>
      </form>
      {body}
    </>
  );
}
