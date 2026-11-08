"use client";

import { useEffect, useState } from "react";

// Центр карточки «Матч дня»: обратный отсчёт до начала, LIVE со счётом или итоговый счёт
export default function Countdown({ iso, status, home, away, timeLabel, labels }) {
  const [now, setNow] = useState(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const live = status === "IN_PLAY" || status === "PAUSED";
  if (live || status === "FINISHED") {
    return (
      <div className="motd-mid">
        <div className={"motd-score" + (live ? " is-live" : "")}>
          {home ?? "–"} : {away ?? "–"}
        </div>
        <div className={"small " + (live ? "live" : "muted")}>
          {live ? labels.live : labels.finished}
        </div>
      </div>
    );
  }

  let text = null;
  if (now !== null) {
    const diff = new Date(iso).getTime() - now;
    if (diff > 0) {
      const totalMin = Math.floor(diff / 60000);
      const d = Math.floor(totalMin / 1440);
      const h = Math.floor((totalMin % 1440) / 60);
      const m = totalMin % 60;
      text =
        d > 0 ? `${d} ${labels.d} ${h} ${labels.h}` : `${h} ${labels.h} ${m} ${labels.m}`;
    }
  }

  return (
    <div className="motd-mid">
      <div className="motd-time">{timeLabel}</div>
      {text && (
        <div className="muted small">
          {labels.startsIn} {text}
        </div>
      )}
    </div>
  );
}
