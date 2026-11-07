import Link from "next/link";
import { addDays, dayLabel } from "@/lib/format";

// Полоса с днями: вчера, сегодня, завтра и ещё по 3 дня в обе стороны
export default function DateStrip({ lang, t, today, selected }) {
  const keys = [-3, -2, -1, 0, 1, 2, 3].map((n) => addDays(today, n));
  return (
    <nav className="datestrip">
      {keys.map((key) => {
        const { top, bottom } = dayLabel(key, lang, t);
        return (
          <Link
            key={key}
            href={`/${lang}?date=${key}`}
            className={"daypill" + (key === selected ? " active" : "")}
          >
            <span>{top}</span>
            <b>{bottom}</b>
          </Link>
        );
      })}
    </nav>
  );
}
