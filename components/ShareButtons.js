"use client";

import { useState } from "react";

function icsDate(d) {
  return new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

// «Поделиться» (меню телефона или копирование ссылки) и «В календарь» (файл .ics)
export default function ShareButtons({ title, startIso, showCalendar, labels }) {
  const [msg, setMsg] = useState("");

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setMsg(labels.copied);
      setTimeout(() => setMsg(""), 2500);
    } catch {}
  }

  function calendar() {
    const start = new Date(startIso);
    const end = new Date(start.getTime() + 2 * 3600 * 1000);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Football Top-5//RU",
      "BEGIN:VEVENT",
      `UID:${icsDate(start)}-${encodeURIComponent(title)}@football-site`,
      `DTSTAMP:${icsDate(new Date())}`,
      `DTSTART:${icsDate(start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${title.replace(/[,;\n]/g, " ")}`,
      `URL:${window.location.href}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "match.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="sharebar">
      <button type="button" className="follow" onClick={share}>
        ↗ {labels.share}
      </button>
      {showCalendar && (
        <button type="button" className="follow" onClick={calendar}>
          📅 {labels.calendar}
        </button>
      )}
      {msg && <span className="muted small">{msg}</span>}
    </div>
  );
}
