import Link from "next/link";
import { getDict } from "@/lib/dictionary";
import { LEAGUES } from "@/lib/leagues";
import LangSwitch from "./LangSwitch";

export default function Header({ lang }) {
  const t = getDict(lang);
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href={`/${lang}`} className="logo">
          ⚽ {t.siteName}
        </Link>
        <nav className="nav">
          {LEAGUES.map((l) => (
            <Link key={l.code} href={`/${lang}/league/${l.code}`}>
              {l.name[lang]}
            </Link>
          ))}
        </nav>
        <LangSwitch lang={lang} />
      </div>
    </header>
  );
}
