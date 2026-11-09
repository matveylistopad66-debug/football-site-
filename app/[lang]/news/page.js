import NewsList from "@/components/NewsList";
import { getDict } from "@/lib/dictionary";
import { getNews } from "@/lib/api";

export const revalidate = 900;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return { title: getDict(lang).newsTitle };
}

export default async function NewsPage({ params }) {
  const { lang } = await params;
  const t = getDict(lang);
  const { news } = await getNews();
  return (
    <>
      <h1>📰 {t.newsTitle}</h1>
      <NewsList news={news.slice(0, 30)} lang={lang} emptyText={t.newsEmpty} />
      <p className="muted small pad">{t.newsNote}</p>
    </>
  );
}
