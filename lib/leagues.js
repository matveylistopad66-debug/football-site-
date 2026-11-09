// Топ-5 лиг. code — идентификатор в football-data.org
export const LEAGUES = [
  {
    code: "PL",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    name: { ru: "Английская Премьер-лига", en: "Premier League", be: "Ангельская Прэм'ер-ліга" },
    country: { ru: "Англия", en: "England", be: "Англія" },
  },
  {
    code: "PD",
    flag: "🇪🇸",
    name: { ru: "Ла Лига", en: "La Liga", be: "Ла Ліга" },
    country: { ru: "Испания", en: "Spain", be: "Іспанія" },
  },
  {
    code: "SA",
    flag: "🇮🇹",
    name: { ru: "Серия A", en: "Serie A", be: "Серыя A" },
    country: { ru: "Италия", en: "Italy", be: "Італія" },
  },
  {
    code: "BL1",
    flag: "🇩🇪",
    name: { ru: "Бундеслига", en: "Bundesliga", be: "Бундэсліга" },
    country: { ru: "Германия", en: "Germany", be: "Германія" },
  },
  {
    code: "FL1",
    flag: "🇫🇷",
    name: { ru: "Лига 1", en: "Ligue 1", be: "Ліга 1" },
    country: { ru: "Франция", en: "France", be: "Францыя" },
  },
  {
    code: "CL",
    flag: "🇪🇺",
    name: { ru: "Лига чемпионов", en: "Champions League", be: "Ліга чэмпіёнаў" },
    country: { ru: "Европа", en: "Europe", be: "Еўропа" },
  },
];

export function getLeague(code) {
  return LEAGUES.find((l) => l.code === code.toUpperCase());
}
