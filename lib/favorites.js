"use client";

// Любимые команды хранятся в самом браузере посетителя (localStorage).
// Аккаунт не нужен. На другом устройстве или в другом браузере список будет пустым.
import { useEffect, useState } from "react";

const KEY = "fav-teams-v1";

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(arr)) return [];
    return arr.filter((x) => x && Number.isInteger(x.id) && typeof x.name === "string");
  } catch {
    return [];
  }
}

function write(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
  window.dispatchEvent(new Event("favorites-changed"));
}

export function useFavorites() {
  const [teams, setTeams] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setTeams(read());
    sync();
    setReady(true);
    window.addEventListener("favorites-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("favorites-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = (team) => {
    const cur = read();
    const has = cur.some((x) => x.id === team.id);
    write(
      has
        ? cur.filter((x) => x.id !== team.id)
        : [...cur, { id: team.id, name: team.name, crest: team.crest ?? null }]
    );
  };

  const clear = () => write([]);

  return { teams, ids: teams.map((x) => x.id), ready, toggle, clear };
}
