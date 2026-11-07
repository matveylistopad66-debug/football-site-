import Link from "next/link";
import MatchList from "@/components/MatchList";
import DateStrip from "@/components/DateStrip";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import { getMatchesWindow } from "@/lib/api";
import { dayKey, todayKey } from "@/lib/format";

export default async function Home({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);

  const today = todayKey();
  const raw = typeof sp?.date === "string" ? sp.date : "";
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : today;

  const { demo, error, matches } = await getMatchesWindow();
  const dayMatches = matches.filter((m) => dayKey(m.utcDate) === selected);

  const groups = LEAGUES.map((league) => ({
    league,
    items: dayMatches.filter((m) => m.competition?.code === league.code),
  })).filter((g) => g.items.length);

  return (
    <>
      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}

      <DateStrip lang={lang} t={t} today={today} selected={selected} />

      {groups.length === 0 && !error ? (
        <p className="muted pad">{t.noMatchesDay}</p>
      ) : (
        groups.map(({ league, items }) => (
          <section key={league.code} className="group">
            <Link href={`/${lang}/league/${league.code}`} className="group-head">
              <span className="flag-sm">{league.flag}</span>
              <strong>{league.name[lang]}</strong>
              <span className="muted">{league.country[lang]}</span>
            </Link>
            <MatchList matches={items} lang={lang} timeOnly />
          </section>
        ))
      )}

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
    </>
  );
}
