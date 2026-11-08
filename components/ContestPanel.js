"use client";

import { useEffect, useState } from "react";
import Crest from "./Crest";
import { formatDateTime } from "@/lib/format";

// Прогнозы: никнейм посетителя и список матчей с полями для счёта.
// Идентификатор посетителя хранится в браузере (localStorage), регистрация по почте не нужна.
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

export default function ContestPanel({ lang, matches, labels }) {
  const [uid, setUid] = useState(null);
  const [state, setState] = useState("loading"); // loading | nostorage | unavailable | join | ready
  const [me, setMe] = useState(null);
  const [nick, setNick] = useState("");
  const [nickErr, setNickErr] = useState("");
  const [draft, setDraft] = useState({});
  const [msg, setMsg] = useState({});

  async function loadMe(id) {
    try {
      const res = await fetch(`/api/predict/me?uid=${id}`, { cache: "no-store" });
      if (res.status === 503) return setState("unavailable");
      const data = await res.json();
      if (data.exists) {
        setMe(data);
        setState("ready");
      } else {
        setState("join");
      }
    } catch {
      setState("unavailable");
    }
  }

  useEffect(() => {
    const id = getUid();
    if (!id) return setState("nostorage");
    setUid(id);
    loadMe(id);
  }, []);

  async function join(e) {
    e.preventDefault();
    setNickErr("");
    try {
      const res = await fetch("/api/predict/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, name: nick }),
      });
      const data = await res.json();
      if (res.ok) return loadMe(uid);
      if (res.status === 503) return setState("unavailable");
      setNickErr(data.error === "name_taken" ? labels.nickTaken : labels.nickBad);
    } catch {
      setState("unavailable");
    }
  }

  async function save(m) {
    const d = draft[m.id] ?? {};
    const prev = me?.preds?.[m.id];
    const home = d.h ?? prev?.h;
    const away = d.a ?? prev?.a;
    if (home === undefined || home === "" || away === undefined || away === "") {
      return setMsg((s) => ({ ...s, [m.id]: labels.fillScore }));
    }
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, matchId: m.id, home: Number(home), away: Number(away) }),
      });
      const data = await res.json();
      if (res.ok) {
        setMe((cur) => ({
          ...cur,
          preds: { ...cur.preds, [m.id]: { h: Number(home), a: Number(away), ko: Date.parse(m.utcDate) } },
        }));
        setMsg((s) => ({ ...s, [m.id]: labels.saved }));
      } else {
        setMsg((s) => ({ ...s, [m.id]: data.error === "closed" ? labels.closed : labels.saveError }));
      }
    } catch {
      setMsg((s) => ({ ...s, [m.id]: labels.saveError }));
    }
  }

  if (state === "loading") return <p className="muted pad">{labels.loading}</p>;
  if (state === "nostorage") return <p className="muted pad">{labels.noStorage}</p>;
  if (state === "unavailable") return <div className="notice">{labels.unavailable}</div>;

  if (state === "join") {
    return (
      <form className="join" onSubmit={join}>
        <p>{labels.joinText}</p>
        <div className="join-row">
          <input
            className="search"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            placeholder={labels.nickPlaceholder}
            maxLength={20}
          />
          <button type="submit" className="follow on">
            {labels.join}
          </button>
        </div>
        {nickErr && <p className="live small">{nickErr}</p>}
        <p className="muted small">{labels.nickNote}</p>
      </form>
    );
  }

  return (
    <div>
      <p className="muted">
        {labels.you}: <strong>{me.name}</strong> · {labels.pts}: <strong>{me.total}</strong>
      </p>
      {matches.length === 0 && <p className="muted pad">{labels.noOpen}</p>}
      <ul className="pred-list">
        {matches.map((m) => {
          const prev = me.preds?.[m.id];
          const d = draft[m.id] ?? {};
          const closed =
            Date.now() >= Date.parse(m.utcDate) || !["SCHEDULED", "TIMED"].includes(m.status);
          const hv = d.h ?? (prev ? String(prev.h) : "");
          const av = d.a ?? (prev ? String(prev.a) : "");
          const set = (k, v) => setDraft((s) => ({ ...s, [m.id]: { ...s[m.id], [k]: v } }));
          return (
            <li key={m.id} className="pred">
              <div className="muted small">{formatDateTime(m.utcDate, lang)}</div>
              <div className="pred-row">
                <span className="match-team right">
                  <span>{m.homeTeam.shortName || m.homeTeam.name}</span>
                  <Crest team={m.homeTeam} />
                </span>
                <span className="pred-inputs">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    inputMode="numeric"
                    value={hv}
                    disabled={closed}
                    onChange={(e) => set("h", e.target.value)}
                  />
                  <b>:</b>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    inputMode="numeric"
                    value={av}
                    disabled={closed}
                    onChange={(e) => set("a", e.target.value)}
                  />
                </span>
                <span className="match-team">
                  <Crest team={m.awayTeam} />
                  <span>{m.awayTeam.shortName || m.awayTeam.name}</span>
                </span>
              </div>
              <div className="pred-foot small">
                {!closed && (
                  <button type="button" className="follow" onClick={() => save(m)}>
                    {labels.save}
                  </button>
                )}
                {closed && !prev && <span className="muted">{labels.noPred}</span>}
                {closed && prev && prev.pts === undefined && (
                  <span className="muted">{labels.waiting}</span>
                )}
                {prev && prev.pts !== undefined && (
                  <span className={prev.pts > 0 ? "plus" : "muted"}>+{prev.pts}</span>
                )}
                {msg[m.id] && <span className="muted">{msg[m.id]}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
