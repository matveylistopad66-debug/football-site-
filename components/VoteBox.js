"use client";

import { useEffect, useState } from "react";

function getUid() {
  try {
    let u = localStorage.getItem("contest-uid");
    if (!u) {
      u = crypto.randomUUID();
      localStorage.setItem("contest-uid", u);
    }
    return u;
  } catch {
    return null;
  }
}

// Голосование «Кто победит?»: 1 / Н / 2. Один голос с одного браузера.
export default function VoteBox({ matchId, open, labels }) {
  const [counts, setCounts] = useState(null);
  const [mine, setMine] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const uid = getUid();
    let stop = false;
    (async () => {
      try {
        const res = await fetch(`/api/vote?matchId=${matchId}&uid=${uid ?? ""}`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        const d = await res.json();
        if (!stop) {
          setCounts(d.counts);
          setMine(d.mine ?? null);
        }
      } catch {
        if (!stop) setHidden(true);
      }
    })();
    return () => {
      stop = true;
    };
  }, [matchId]);

  async function vote(choice) {
    const uid = getUid();
    if (!uid) return;
    setMsg("");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, matchId, choice }),
      });
      const d = await res.json();
      if (!res.ok) return setMsg(labels.error);
      setCounts(d.counts);
      setMine(d.mine);
      setMsg(labels.thanks);
    } catch {
      setMsg(labels.error);
    }
  }

  if (hidden || !counts) return null;
  const total = counts.h + counts.d + counts.a;
  const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
  const showResults = mine || !open;
  const items = [
    { k: "h", label: labels.home },
    { k: "d", label: labels.draw },
    { k: "a", label: labels.away },
  ];

  return (
    <section className="votebox">
      <h3>{labels.title}</h3>
      {!showResults && (
        <div className="voterow">
          {items.map((i) => (
            <button key={i.k} type="button" className="follow" onClick={() => vote(i.k)}>
              {i.label}
            </button>
          ))}
        </div>
      )}
      {showResults && (
        <div className="votebars">
          {items.map((i) => (
            <div key={i.k} className={"votebar" + (mine === i.k ? " mine" : "")}>
              <span>{i.label}</span>
              <div className="bar">
                <i style={{ width: pct(counts[i.k]) + "%" }} />
              </div>
              <b>{pct(counts[i.k])}%</b>
            </div>
          ))}
        </div>
      )}
      <p className="muted small">
        {total} {labels.count}
        {msg ? ` · ${msg}` : ""}
      </p>
    </section>
  );
}
