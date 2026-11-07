"use client";

import Link from "next/link";
import Crest from "./Crest";
import MatchList from "./MatchList";
import { useFavorites } from "@/lib/favorites";

// Блок «Мои команды» на главной: значки любимых клубов и их ближайшие матчи
export default function FavMatches({ lang, matches, labels }) {
  const { teams, ids, ready } = useFavorites();
  if (!ready) return null;

  if (!teams.length) {
    return (
      <Link href={`/${lang}/profile`} className="fav-cta">
        {labels.cta}
      </Link>
    );
  }

  const mine = matches
    .filter((m) => ids.includes(m.homeTeam?.id) || ids.includes(m.awayTeam?.id))
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(0, 10);

  return (
    <section className="group">
      <div className="group-head">
        <span className="flag-sm">★</span>
        <strong>{labels.title}</strong>
        <Link href={`/${lang}/profile`} className="more push">
          {labels.edit}
        </Link>
      </div>
      <div className="chips">
        {teams.map((tm) => (
          <Link key={tm.id} href={`/${lang}/team/${tm.id}`} className="chip">
            <Crest team={tm} size={18} />
            <span>{tm.name}</span>
          </Link>
        ))}
      </div>
      <MatchList matches={mine} lang={lang} emptyText={labels.empty} />
    </section>
  );
}
