"use client";

import { useState } from "react";
import Link from "next/link";
import Crest from "./Crest";

// Поиск по клубам и лигам: фильтрует список прямо в браузере
export default function SearchBox({ lang, teams, leagues, labels }) {
  const [q, setQ] = useState("");
  const norm = (s) => (s || "").toLowerCase().replace(/ё/g, "е");
  const query = norm(q.trim());

  const foundTeams = query
    ? teams.filter((x) => norm(x.name).includes(query) || norm(x.short).includes(query)).slice(0, 30)
    : [];
  const foundLeagues = query ? leagues.filter((l) => norm(l.name).includes(query)) : [];

  return (
    <>
      <input
        className="search"
        type="search"
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={labels.placeholder}
      />
      {!query && <p className="muted pad">{labels.hint}</p>}
      {query && !foundTeams.length && !foundLeagues.length && (
        <p className="muted pad">{labels.none}</p>
      )}
      {foundLeagues.length > 0 && (
        <>
          <h2>{labels.leagues}</h2>
          <ul className="resultlist">
            {foundLeagues.map((l) => (
              <li key={l.code}>
                <Link href={`/${lang}/league/${l.code}`}>
                  <span>{l.flag}</span> <strong>{l.name}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {foundTeams.length > 0 && (
        <>
          <h2>{labels.teams}</h2>
          <ul className="resultlist">
            {foundTeams.map((x) => (
              <li key={x.id}>
                <Link href={`/${lang}/team/${x.id}`}>
                  <Crest team={{ crest: x.crest }} size={22} /> <strong>{x.short || x.name}</strong>
                  <span className="muted small"> {x.league}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
