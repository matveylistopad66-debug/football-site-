// Демо-данные: показываются, пока не добавлен API-ключ.
// Формат такой же, как у football-data.org, поэтому остальной код не меняется.

const t = (id, name) => ({ id, name, shortName: name, crest: null });

const A = t(901, "Team Alpha");
const B = t(902, "Team Bravo");
const C = t(903, "Team Charlie");
const D = t(904, "Team Delta");
const E = t(905, "Team Echo");
const F = t(906, "Team Foxtrot");

export const DEMO_TABLE = [
  { position: 1, team: A, playedGames: 10, won: 8, draw: 1, lost: 1, goalsFor: 24, goalsAgainst: 8, goalDifference: 16, points: 25 },
  { position: 2, team: B, playedGames: 10, won: 7, draw: 2, lost: 1, goalsFor: 21, goalsAgainst: 9, goalDifference: 12, points: 23 },
  { position: 3, team: C, playedGames: 10, won: 6, draw: 2, lost: 2, goalsFor: 18, goalsAgainst: 11, goalDifference: 7, points: 20 },
  { position: 4, team: D, playedGames: 10, won: 5, draw: 3, lost: 2, goalsFor: 16, goalsAgainst: 12, goalDifference: 4, points: 18 },
  { position: 5, team: E, playedGames: 10, won: 4, draw: 3, lost: 3, goalsFor: 14, goalsAgainst: 13, goalDifference: 1, points: 15 },
  { position: 6, team: F, playedGames: 10, won: 2, draw: 2, lost: 6, goalsFor: 9, goalsAgainst: 17, goalDifference: -8, points: 8 },
];

const day = (offset) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offset);
  d.setUTCHours(17, 0, 0, 0);
  return d.toISOString();
};

const comp = { code: "PL", name: "Premier League" };

export const DEMO_MATCHES = [
  { id: 1, competition: comp, utcDate: day(-2), status: "FINISHED", homeTeam: A, awayTeam: B, score: { fullTime: { home: 2, away: 1 } } },
  { id: 2, competition: comp, utcDate: day(-1), status: "FINISHED", homeTeam: C, awayTeam: D, score: { fullTime: { home: 0, away: 0 } } },
  { id: 3, competition: comp, utcDate: day(0), status: "TIMED", homeTeam: E, awayTeam: F, score: { fullTime: { home: null, away: null } } },
  { id: 4, competition: comp, utcDate: day(1), status: "SCHEDULED", homeTeam: B, awayTeam: C, score: { fullTime: { home: null, away: null } } },
];

export const DEMO_SCORERS = [
  { player: { name: "Player One" }, team: A, playedMatches: 10, goals: 11, assists: 3, penalties: 2 },
  { player: { name: "Player Two" }, team: B, playedMatches: 10, goals: 9, assists: 4, penalties: 1 },
  { player: { name: "Player Three" }, team: C, playedMatches: 9, goals: 7, assists: 2, penalties: 0 },
  { player: { name: "Player Four" }, team: D, playedMatches: 10, goals: 6, assists: 5, penalties: 1 },
];
