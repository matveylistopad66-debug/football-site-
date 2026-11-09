"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Нижнее меню для телефона (на компьютере скрыто)
export default function BottomNav({ lang, labels }) {
  const path = usePathname() || "";
  const items = [
    { href: `/${lang}`, icon: "🏠", label: labels.home, active: path === `/${lang}` },
    { href: `/${lang}/search`, icon: "🔍", label: labels.search, active: path.startsWith(`/${lang}/search`) },
    { href: `/${lang}/news`, icon: "📰", label: labels.news, active: path.startsWith(`/${lang}/news`) },
    { href: `/${lang}/contest`, icon: "🏆", label: labels.contest, active: path.startsWith(`/${lang}/contest`) },
    { href: `/${lang}/profile`, icon: "☆", label: labels.profile, active: path.startsWith(`/${lang}/profile`) },
  ];
  return (
    <nav className="bottomnav" aria-label="menu">
      {items.map((i) => (
        <Link key={i.href} href={i.href} className={i.active ? "active" : ""}>
          <span className="bn-ico">{i.icon}</span>
          <span className="bn-txt">{i.label}</span>
        </Link>
      ))}
    </nav>
  );
}
