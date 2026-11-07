// Превращает голы, карточки и замены матча в единый список событий
// и в метки для каждого игрока (например: жёлтая карточка 34', ушёл с поля 67').

export function minuteLabel(minute, injuryTime) {
  if (minute === null || minute === undefined) return "";
  return `${minute}${injuryTime ? "+" + injuryTime : ""}'`;
}

const sortKey = (e) => (e.minute ?? 0) + (e.injury ?? 0) / 100;

export function buildEvents(m) {
  const out = [];
  for (const g of m.goals ?? []) {
    out.push({
      type: "goal",
      kind: g.type === "OWN" ? "owngoal" : "goal",
      pen: g.type === "PENALTY",
      minute: g.minute,
      injury: g.injuryTime,
      teamId: g.team?.id,
      playerId: g.scorer?.id,
      name: g.scorer?.name,
      assist: g.assist?.name,
    });
  }
  for (const b of m.bookings ?? []) {
    out.push({
      type: "card",
      kind: b.card === "RED" ? "red" : b.card === "YELLOW_RED" ? "yellowred" : "yellow",
      minute: b.minute,
      teamId: b.team?.id,
      playerId: b.player?.id,
      name: b.player?.name,
    });
  }
  for (const s of m.substitutions ?? []) {
    out.push({
      type: "sub",
      kind: "sub",
      minute: s.minute,
      teamId: s.team?.id,
      outId: s.playerOut?.id,
      outName: s.playerOut?.name,
      inId: s.playerIn?.id,
      inName: s.playerIn?.name,
    });
  }
  return out.sort((a, b) => sortKey(a) - sortKey(b));
}

// Map: id игрока -> список меток [{ kind, minute }]
export function marksByPlayer(events) {
  const map = new Map();
  const add = (id, mark) => {
    if (id === null || id === undefined) return;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(mark);
  };
  for (const e of events) {
    const minute = minuteLabel(e.minute, e.injury);
    if (e.type === "sub") {
      add(e.outId, { kind: "out", minute });
      add(e.inId, { kind: "in", minute });
    } else {
      add(e.playerId, { kind: e.kind, minute });
    }
  }
  return map;
}
