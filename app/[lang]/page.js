import Link from "next/link";
import MatchList from "@/components/MatchList";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import { getTodayMatches } from "@/lib/api";

export const revalidate = 300;

export default async function Home({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { demo, error, matches } = await getTodayMatches();

  return (
    <>
      <section className="hero">
        <h1>{t.siteName}</h1>
        <p>{t.tagline}</p>
      </section>

      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}

      <h2>{t.leagues}</h2>
      <div className="cards">
        {LEAGUES.map((l) => (
          <Link key={l.code} href={`/${lang}/league/${l.code}`} className="card">
            <span className="flag">{l.flag}</span>
            <strong>{l.name[lang]}</strong>
            <span className="muted">{l.country[lang]}</span>
          </Link>
        ))}
      </div>

      <h2>{t.todayMatches}</h2>
      <MatchList matches={matches} lang={lang} emptyText={t.noMatchesToday} />
    </>
  );
}
