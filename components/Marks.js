// Метки событий рядом с игроком: гол, карточки, уход/выход с поля (с минутой)
function Icon({ kind }) {
  switch (kind) {
    case "goal":
    case "owngoal":
      return <span>⚽</span>;
    case "yellow":
      return <span className="cardmark yellow" />;
    case "red":
      return <span className="cardmark red" />;
    case "yellowred":
      return <span className="cardmark yellowred" />;
    case "out":
      return <span>↓</span>;
    case "in":
      return <span>↑</span>;
    default:
      return null;
  }
}

export default function Marks({ marks }) {
  if (!marks || !marks.length) return null;
  return (
    <span className="marks">
      {marks.map((mk, i) => (
        <span key={i} className={`mark ${mk.kind}`}>
          <Icon kind={mk.kind} />
          {mk.minute ? <i>{mk.minute}</i> : null}
        </span>
      ))}
    </span>
  );
}
