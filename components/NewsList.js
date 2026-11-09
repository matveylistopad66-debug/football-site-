import { formatDateTime } from "@/lib/format";

// Список новостей: заголовок, источник, дата. Ссылки открываются на сайте источника.
export default function NewsList({ news, lang, emptyText }) {
  if (!news?.length) return <p className="muted pad">{emptyText}</p>;
  return (
    <ul className="newslist">
      {news.map((n) => (
        <li key={n.link}>
          <a href={n.link} target="_blank" rel="noopener noreferrer">
            {n.title}
          </a>
          <span className="muted small">
            {n.source}
            {n.ts ? ` · ${formatDateTime(new Date(n.ts).toISOString(), lang)}` : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
