// Логотип клуба. Если логотипа нет, показывается серый кружок.
export default function Crest({ team, size = 20 }) {
  if (!team?.crest) {
    return <span className="crest-ph" style={{ width: size, height: size }} />;
  }
  return <img src={team.crest} alt="" width={size} height={size} loading="lazy" />;
}
