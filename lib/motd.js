// Выбор «Матча дня»: чем выше в таблице обе команды, тем интереснее матч. Матчи Лиги чемпионов получают бонус.
export function pickMatchOfDay(pool, tablesByCode) {
  let best = null;
  let bestScore = -1;
  for (const m of pool) {
    const code = m.competition?.code;
    const table = tablesByCode[code] ?? [];
    const size = table.length || 20;
    const strength = (team) => {
      const row = table.find((r) => r.team.id === team?.id);
      return row ? 1 - (row.position - 1) / size : 0.4;
    };
    let score = strength(m.homeTeam) + strength(m.awayTeam);
    if (code === "CL") score += 0.4;
    if (score > bestScore) {
      best = m;
      bestScore = score;
    }
  }
  return best;
}
