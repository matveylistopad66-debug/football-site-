// ЦВЕТНЫЕ ЗОНЫ ТУРНИРНЫХ ТАБЛИЦ.
// Правила квалификации в еврокубки меняются каждый сезон, поэтому числа ПРИМЕРНЫЕ.
// Чтобы поправить: измените числа from (с какого места) и to (по какое).
// kind (цвет): "cl" зелёный, "el" синий, "ecl" бирюзовый, "po" жёлтый, "rel" красный.
// label: ключ подписи из lib/dictionary.js.
export function zonesFor(code, size) {
  const last = (n) => ({ from: size - n + 1, to: size, kind: "rel", label: "zoneRel" });
  switch (code) {
    case "PL":
      return [
        { from: 1, to: 4, kind: "cl", label: "zoneCl" },
        { from: 5, to: 5, kind: "el", label: "zoneEl" },
        { from: 6, to: 6, kind: "ecl", label: "zoneEcl" },
        last(3),
      ];
    case "PD":
    case "SA":
      return [
        { from: 1, to: 4, kind: "cl", label: "zoneCl" },
        { from: 5, to: 6, kind: "el", label: "zoneEl" },
        last(3),
      ];
    case "BL1":
      return [
        { from: 1, to: 4, kind: "cl", label: "zoneCl" },
        { from: 5, to: 5, kind: "el", label: "zoneEl" },
        { from: 6, to: 6, kind: "ecl", label: "zoneEcl" },
        { from: size - 2, to: size - 2, kind: "po", label: "zonePo" },
        last(2),
      ];
    case "FL1":
      return [
        { from: 1, to: 3, kind: "cl", label: "zoneCl" },
        { from: 4, to: 4, kind: "el", label: "zoneEl" },
        { from: 5, to: 5, kind: "ecl", label: "zoneEcl" },
        { from: size - 2, to: size - 2, kind: "po", label: "zonePo" },
        last(2),
      ];
    case "CL":
      // Новый формат: 36 команд в одной таблице
      if (size !== 36) return [];
      return [
        { from: 1, to: 8, kind: "cl", label: "zoneR16" },
        { from: 9, to: 24, kind: "po", label: "zoneClPo" },
        { from: 25, to: 36, kind: "rel", label: "zoneOut" },
      ];
    default:
      return [];
  }
}
