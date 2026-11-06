// Топ-5 лиг. code — идентификатор в football-data.org
export const LEAGUES = [
  {
    code: "PL",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    name: { ru: "Английская Премьер-лига", en: "Premier League" },
    country: { ru: "Англия", en: "England" },
  },
  {
    code: "PD",
    flag: "🇪🇸",
    name: { ru: "Ла Лига", en: "La Liga" },
    country: { ru: "Испания", en: "Spain" },
  },
  {
    code: "SA",
    flag: "🇮🇹",
    name: { ru: "Серия A", en: "Serie A" },
    country: { ru: "Италия", en: "Italy" },
  },
  {
    code: "BL1",
    flag: "🇩🇪",
    name: { ru: "Бундеслига", en: "Bundesliga" },
    country: { ru: "Германия", en: "Germany" },
  },
  {
    code: "FL1",
    flag: "🇫🇷",
    name: { ru: "Лига 1", en: "Ligue 1" },
    country: { ru: "Франция", en: "France" },
  },
];

export function getLeague(code) {
  return LEAGUES.find((l) => l.code === code.toUpperCase());
}
