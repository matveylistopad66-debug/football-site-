"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Горизонтальное меню лиг с подсветкой текущей страницы
export default function LeagueTabs({ lang, homeLabel, leagues }) {
  const path = usePathname() || "";
  const items = [
    { href: `/${lang}`, label: homeLabel, active: path === `/${lang}` },
    ...leagues.map((l) => ({
      href: `/${lang}/league/${l.code}`,
      label: l.name,
      active: path.startsWith(`/${lang}/league/${l.code}`),
    })),
  ];
  return (
    <nav className="tabs">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={"tab" + (i.active ? " active" : "")}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
