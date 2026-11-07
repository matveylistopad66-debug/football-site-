// Подсказка поисковикам: сайт открыт, карта сайта по адресу /sitemap.xml
import { SITE_URL } from "@/lib/config";

export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api-check"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
