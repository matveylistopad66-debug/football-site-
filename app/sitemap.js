// Карта сайта для Google: сайт сам отдаёт её по адресу /sitemap.xml
import { LEAGUES } from "@/lib/leagues";
import { LANGS } from "@/lib/dictionary";
import { SITE_URL } from "@/lib/config";

export default function sitemap() {
  const pages = [];
  for (const lang of LANGS) {
    pages.push({ url: `${SITE_URL}/${lang}`, changeFrequency: "hourly", priority: 1 });
    pages.push({ url: `${SITE_URL}/${lang}/contest`, changeFrequency: "daily", priority: 0.7 });
    pages.push({ url: `${SITE_URL}/${lang}/news`, changeFrequency: "hourly", priority: 0.6 });
    pages.push({ url: `${SITE_URL}/${lang}/compare`, changeFrequency: "daily", priority: 0.5 });
    for (const l of LEAGUES) {
      pages.push({
        url: `${SITE_URL}/${lang}/league/${l.code}`,
        changeFrequency: "hourly",
        priority: 0.8,
      });
    }
  }
  return pages;
}
