import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { LANGS, getDict } from "@/lib/dictionary";
import { SITE_URL } from "@/lib/config";
import "../globals.css";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.siteName, template: `%s | ${t.siteName}` },
    description: t.tagline,
    alternates: { languages: { ru: "/ru", en: "/en" } },
    openGraph: {
      title: t.siteName,
      description: t.tagline,
      siteName: t.siteName,
      type: "website",
      locale: lang === "ru" ? "ru_RU" : "en_GB",
    },
  };
}

export default async function LangLayout({ children, params }) {
  const { lang } = await params;
  if (!LANGS.includes(lang)) notFound();
  const t = getDict(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var t=localStorage.getItem("theme");if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";document.documentElement.dataset.theme=t}catch(e){}',
          }}
        />
      </head>
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
