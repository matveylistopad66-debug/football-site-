// Облегчённые копии матча и команды: передаются в клиентские компоненты (меньше данных на страницу)
export function slimTeam(tm) {
  return {
    id: tm?.id ?? null,
    name: tm?.name ?? null,
    shortName: tm?.shortName ?? null,
    crest: tm?.crest ?? null,
  };
}

export function slimMatch(m) {
  return {
    id: m.id,
    utcDate: m.utcDate,
    status: m.status,
    homeTeam: slimTeam(m.homeTeam),
    awayTeam: slimTeam(m.awayTeam),
    score: {
      fullTime: {
        home: m.score?.fullTime?.home ?? null,
        away: m.score?.fullTime?.away ?? null,
      },
    },
  };
}
