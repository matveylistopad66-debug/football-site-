import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { LANGS, getDict } from "@/lib/dictionary";
import "../globals.css";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  return {
    title: { default: t.siteName, template: `%s | ${t.siteName}` },
    description: t.tagline,
  };
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  if (!LANGS.includes(lang)) notFound();
  const t = getDict(lang);

  return (
    <html lang={lang}>
      <body>
        <Header lang={lang} />
        <main className="container">{children}</main>
        <footer className="footer">
          <div className="container">{t.footer}</div>
        </footer>
      </body>
    </html>
  );
}
