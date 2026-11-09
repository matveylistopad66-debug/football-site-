"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Переключатель языка: заменяет первый сегмент пути (/ru/... <-> /en/...)
export default function LangSwitch({ lang }) {
  const pathname = usePathname() || `/${lang}`;
  const rest = pathname.split("/").slice(2).join("/");
  const build = (l) => `/${l}${rest ? "/" + rest : ""}`;

  return (
    <div className="lang">
      {["ru", "en", "be"].map((l) => (
        <Link
          key={l}
          href={build(l)}
          className={l === lang ? "active" : ""}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
