import Link from "next/link";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import LangSwitch from "./LangSwitch";
import LeagueTabs from "./LeagueTabs";

export default function Header({ lang }) {
  const t = getDict(lang);
  return (
    <header className="header">
      <div className="container topbar">
        <Link href={`/${lang}`} className="logo">
          <span className="logo-ball">⚽</span> {t.siteName}
        </Link>
        <div className="topbar-right">
          <Link href={`/${lang}/profile`} className="profile-btn">
            ☆ {t.profile}
          </Link>
          <LangSwitch lang={lang} />
        </div>
      </div>
      <div className="container">
        <LeagueTabs
          lang={lang}
          homeLabel={t.home}
          leagues={LEAGUES.map((l) => ({ code: l.code, name: l.name[lang] }))}
        />
      </div>
    </header>
  );
}
