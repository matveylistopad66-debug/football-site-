"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Горизонтальное меню лиг с подсветкой текущей страницы
export default function LeagueTabs({ lang, homeLabel, contestLabel, leagues }) {
  const path = usePathname() || "";
  const items = [
    { href: `/${lang}`, label: homeLabel, active: path === `/${lang}` },
    ...leagues.map((l) => ({
      href: `/${lang}/league/${l.code}`,
      label: l.name,
      active: path.startsWith(`/${lang}/league/${l.code}`),
    })),
    { href: `/${lang}/contest`, label: `🏆 ${contestLabel}`, active: path.startsWith(`/${lang}/contest`) },
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
