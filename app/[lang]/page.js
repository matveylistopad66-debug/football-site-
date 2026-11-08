import Link from "next/link";
import MatchList from "@/components/MatchList";
import DateStrip from "@/components/DateStrip";
import FavMatches from "@/components/FavMatches";
import MatchOfDay from "@/components/MatchOfDay";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import { getMatchesWindow, getStandings } from "@/lib/api";
import { pickMatchOfDay } from "@/lib/motd";
import { dayKey, todayKey } from "@/lib/format";

export default async function Home({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const t = getDict(lang);

  const today = todayKey();
  const raw = typeof sp?.date === "string" ? sp.date : "";
  const selected = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : today;

  const { demo, error, matches } = await getMatchesWindow();
  // Облегчённая копия матчей для блока «Мои команды»
  const slim = (tm) => ({
    id: tm?.id ?? null,
    name: tm?.name ?? null,
    shortName: tm?.shortName ?? null,
    crest: tm?.crest ?? null,
  });
  const compact = matches.map((m) => ({
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    homeTeam: slim(m.homeTeam),
    awayTeam: slim(m.awayTeam),
    score: {
      fullTime: {
        home: m.score?.fullTime?.home ?? null,
        away: m.score?.fullTime?.away ?? null,
      },
    },
  }));
  const favLabels = { title: t.myTeams, edit: t.editFav, cta: t.favCta, empty: t.favNoMatches };

  // Матч дня: сегодняшние матчи (сначала не сыгранные), иначе ближайший день с матчами
  const okStatus = (m) => !["POSTPONED", "CANCELLED", "SUSPENDED"].includes(m.status);
  const todays = matches.filter((m) => dayKey(m.utcDate) === today && okStatus(m));
  let pool = todays.filter((m) => m.status !== "FINISHED");
  if (!pool.length) pool = todays;
  if (!pool.length) {
    const future = matches
      .filter((m) => okStatus(m) && Date.parse(m.utcDate) > Date.now())
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
    const firstDay = future.length ? dayKey(future[0].utcDate) : null;
    pool = future.filter((m) => dayKey(m.utcDate) === firstDay);
  }
  let featured = null;
  if (pool.length) {
    const codes = [...new Set(pool.map((m) => m.competition?.code).filter(Boolean))];
    const results = await Promise.all(codes.map((c) => getStandings(c)));
    const tables = {};
    codes.forEach((c, i) => {
      tables[c] = results[i].table ?? [];
    });
    featured = pickMatchOfDay(pool, tables);
  }

  const dayMatches = matches.filter((m) => dayKey(m.utcDate) === selected);

  const groups = LEAGUES.map((league) => ({
    league,
    items: dayMatches.filter((m) => m.competition?.code === league.code),
  })).filter((g) => g.items.length);

  return (
    <>
      {demo && <div className="notice">{t.demoNotice}</div>}
      {error && <div className="notice">{t.errorNotice}</div>}

      {featured && <MatchOfDay match={featured} lang={lang} />}

      <FavMatches lang={lang} matches={compact} labels={favLabels} />

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
