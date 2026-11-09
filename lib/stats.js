// Расчёты по сыгранным матчам сезона: форма, таблицы «дома» и «в гостях», факты, туры.
// Всё считается на нашем сервере из одного запроса к API, ничего дополнительного не нужно.

const done = (m) =>
  m.status === "FINISHED" &&
  m.score?.fullTime?.home != null &&
  m.score?.fullTime?.away != null;

export function finished(matches) {
  return (matches ?? []).filter(done).sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
}

// Форма: { [teamId]: ["W","D","L",...] } — последние 5 матчей, старые слева
export function computeForm(matches) {
  const form = {};
  for (const m of finished(matches)) {
    const { home, away } = m.score.fullTime;
    const push = (id, r) => {
      if (id == null) return;
      (form[id] ||= []).push(r);
    };
    push(m.homeTeam?.id, home > away ? "W" : home < away ? "L" : "D");
    push(m.awayTeam?.id, home < away ? "W" : home > away ? "L" : "D");
  }
  for (const id of Object.keys(form)) form[id] = form[id].slice(-5);
  return form;
}

// Таблица только по домашним или только по гостевым матчам. side: "home" | "away"
export function computeSplit(matches, side) {
  const rows = new Map();
  for (const m of finished(matches)) {
    const team = side === "home" ? m.homeTeam : m.awayTeam;
    if (!team?.id) continue;
    const gf = side === "home" ? m.score.fullTime.home : m.score.fullTime.away;
    const ga = side === "home" ? m.score.fullTime.away : m.score.fullTime.home;
    const r =
      rows.get(team.id) ??
      { team, playedGames: 0, won: 0, draw: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
    r.playedGames++;
    r.goalsFor += gf;
    r.goalsAgainst += ga;
    if (gf > ga) {
      r.won++;
      r.points += 3;
    } else if (gf === ga) {
      r.draw++;
      r.points += 1;
    } else r.lost++;
    rows.set(team.id, r);
  }
  return [...rows.values()]
    .map((r) => ({ ...r, goalDifference: r.goalsFor - r.goalsAgainst }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor
    )
    .map((r, i) => ({ ...r, position: i + 1 }));
}

// Интересные факты о лиге. Возвращает массив { key, team?, value, match? }
export function computeFacts(matches, table) {
  const list = finished(matches);
  if (list.length < 5) return [];
  const facts = [];

  const total = list.reduce((s, m) => s + m.score.fullTime.home + m.score.fullTime.away, 0);
  facts.push({ key: "factAvgGoals", value: (total / list.length).toFixed(2) });

  if (table?.length) {
    const played = (r) => r.playedGames || 1;
    const bestAtt = [...table].sort((a, b) => b.goalsFor - a.goalsFor)[0];
    const bestDef = [...table].sort((a, b) => a.goalsAgainst - b.goalsAgainst)[0];
    facts.push({ key: "factBestAttack", team: bestAtt.team, value: `${bestAtt.goalsFor}` });
    facts.push({ key: "factBestDefence", team: bestDef.team, value: `${bestDef.goalsAgainst}` });
    const ppg = [...table].sort((a, b) => b.points / played(b) - a.points / played(a))[0];
    facts.push({ key: "factPpg", team: ppg.team, value: (ppg.points / played(ppg)).toFixed(2) });
  }

  // Лучшая форма: очки за последние 5 матчей
  const form = computeForm(matches);
  let best = null;
  for (const [id, arr] of Object.entries(form)) {
    const pts = arr.reduce((s, r) => s + (r === "W" ? 3 : r === "D" ? 1 : 0), 0);
    if (arr.length >= 5 && (!best || pts > best.pts)) best = { id: Number(id), pts };
  }
  if (best) {
    const m = list.find((x) => x.homeTeam?.id === best.id || x.awayTeam?.id === best.id);
    const team = m.homeTeam?.id === best.id ? m.homeTeam : m.awayTeam;
    facts.push({ key: "factBestForm", team, value: `${best.pts}/15` });
  }

  // Самая крупная победа
  let big = null;
  for (const m of list) {
    const diff = Math.abs(m.score.fullTime.home - m.score.fullTime.away);
    if (!big || diff > big.diff) big = { diff, m };
  }
  if (big && big.diff >= 2) {
    const m = big.m;
    facts.push({
      key: "factBiggestWin",
      match: m,
      value: `${m.score.fullTime.home}:${m.score.fullTime.away}`,
    });
  }

  const homeWins = list.filter((m) => m.score.fullTime.home > m.score.fullTime.away).length;
  facts.push({ key: "factHomeWins", value: `${Math.round((homeWins / list.length) * 100)}%` });
  return facts;
}

// Матчи по турам: { [тур]: [матчи] } и номер текущего тура (первый, где остались несыгранные матчи)
export function groupByMatchday(matches) {
  const byDay = {};
  for (const m of matches ?? []) {
    if (m.matchday == null) continue;
    (byDay[m.matchday] ||= []).push(m);
  }
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const open = days.find((d) =>
    byDay[d].some((m) => !["FINISHED", "POSTPONED", "CANCELLED"].includes(m.status))
  );
  return { byDay, days, current: open ?? days[days.length - 1] ?? null };
}
