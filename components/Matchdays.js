"use client";

import { useState } from "react";
import MatchList from "./MatchList";

// Переключатель туров: показывает матчи выбранного тура
export default function Matchdays({ byDay, days, initial, lang, labels }) {
  const [day, setDay] = useState(initial);
  const i = days.indexOf(day);
  return (
    <>
      <div className="mdnav">
        <button type="button" className="follow" disabled={i <= 0} onClick={() => setDay(days[i - 1])}>
          ← {labels.prev}
        </button>
        <strong>
          {labels.matchday} {day}
        </strong>
        <button
          type="button"
          className="follow"
          disabled={i >= days.length - 1}
          onClick={() => setDay(days[i + 1])}
        >
          {labels.next} →
        </button>
      </div>
      <MatchList matches={byDay[day] ?? []} lang={lang} />
    </>
  );
}
