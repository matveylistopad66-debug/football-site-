"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Crest from "./Crest";
import { useFavorites } from "@/lib/favorites";

// Страница профиля: выбор любимых команд (хранится в этом браузере)
export default function ProfileClient({ lang, teams, labels }) {
  const { teams: favs, ids, toggle, clear } = useFavorites();
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s ? teams.filter((x) => x.name.toLowerCase().includes(s)) : teams;
    const out = [];
    const map = new Map();
    for (const tm of list) {
      if (!map.has(tm.league.code)) {
        const g = { league: tm.league, items: [] };
        map.set(tm.league.code, g);
        out.push(g);
      }
      map.get(tm.league.code).items.push(tm);
    }
    return out;
  }, [q, teams]);

  return (
    <>
      <h2>{labels.favTeams}</h2>
      {favs.length === 0 ? (
        <p className="muted">{labels.noFav}</p>
      ) : (
        <>
          <div className="chips">
            {favs.map((tm) => (
              <Link key={tm.id} href={`/${lang}/team/${tm.id}`} className="chip">
                <Crest team={tm} size={18} />
                <span>{tm.name}</span>
              </Link>
            ))}
          </div>
          <button type="button" className="linkbtn" onClick={clear}>
            {labels.clear}
          </button>
        </>
      )}
      <p className="muted small">{labels.note}</p>

      <input
        type="search"
        className="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={labels.search}
      />

      {groups.length === 0 && <p className="muted pad">{labels.noFound}</p>}

      {groups.map((g) => (
        <section key={g.league.code} className="group">
          <div className="group-head">
            <strong>{g.league.name}</strong>
          </div>
          <div className="team-grid">
            {g.items.map((tm) => {
              const on = ids.includes(tm.id);
              return (
                <button
                  key={tm.id}
                  type="button"
                  className={"pick" + (on ? " on" : "")}
                  aria-pressed={on}
                  onClick={() => toggle({ id: tm.id, name: tm.name, crest: tm.crest })}
                >
                  <Crest team={tm} size={22} />
                  <span className="pick-name">{tm.name}</span>
                  <span className="star">{on ? "★" : "☆"}</span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </>
  );
}
