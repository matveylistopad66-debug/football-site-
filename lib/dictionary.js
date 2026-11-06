// ВСЕ ТЕКСТЫ САЙТА. Меняйте только то, что внутри кавычек "...".
export const LANGS = ["ru", "en"];

const dict = {
  ru: {
    siteName: "Футбол Топ-5",
    tagline: "Таблицы, результаты и бомбардиры пяти сильнейших лиг Европы",
    leagues: "Лиги",
    todayMatches: "Матчи сегодня",
    noMatchesToday: "Сегодня матчей нет.",
    standings: "Турнирная таблица",
    matches: "Матчи (5 дней назад — 4 дня вперёд)",
    scorers: "Бомбардиры",
    team: "Команда",
    played: "И",
    won: "В",
    draw: "Н",
    lost: "П",
    goals: "Мячи",
    gd: "РМ",
    points: "О",
    player: "Игрок",
    assists: "Аст.",
    penalties: "Пен.",
    games: "Матчи",
    demoNotice:
      "Показаны демо-данные. Добавьте API-ключ, чтобы увидеть реальные результаты (см. инструкцию в README).",
    errorNotice:
      "Не удалось загрузить данные. Проверьте API-ключ или подождите минуту (бесплатный лимит — 10 запросов в минуту) и обновите страницу.",
    noData: "Данных пока нет.",
    footer: "Данные: football-data.org",
    openLeague: "Открыть",
    statusLive: "LIVE",
    statusFinished: "Завершён",
  },
  en: {
    siteName: "Football Top-5",
    tagline: "Tables, results and top scorers of Europe's five biggest leagues",
    leagues: "Leagues",
    todayMatches: "Today's matches",
    noMatchesToday: "No matches today.",
    standings: "Standings",
    matches: "Matches (last 5 days — next 4 days)",
    scorers: "Top scorers",
    team: "Team",
    played: "P",
    won: "W",
    draw: "D",
    lost: "L",
    goals: "Goals",
    gd: "GD",
    points: "Pts",
    player: "Player",
    assists: "Ast.",
    penalties: "Pen.",
    games: "Apps",
    demoNotice:
      "Showing demo data. Add an API key to see real results (see README).",
    errorNotice:
      "Could not load data. Check the API key or wait a minute (free limit is 10 requests per minute) and refresh.",
    noData: "No data yet.",
    footer: "Data: football-data.org",
    openLeague: "Open",
    statusLive: "LIVE",
    statusFinished: "Finished",
  },
};

export function getDict(lang) {
  return dict[lang] ?? dict.ru;
}
