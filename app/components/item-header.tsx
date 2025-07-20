import SourceBadge from "./source-badge";

interface ItemHeaderProps {
  name: string;
  source: string;
  badges?: React.ReactNode[];
  line?: number;
}

export default function ItemHeader({
  name,
  source,
  badges,
  line,
}: ItemHeaderProps) {
  return (
    <div>
      <div className="flex items-center gap-2 justify-between">
        <h4 className="text-sm font-semibold text-pink-300">{name}</h4>
        <div>
          <SourceBadge source={source} />|
        </div>
        {/* {badges &&
          badges.map((badge, index) => <span key={index}>{badge}</span>)} */}
      </div>
      {/* {line && <div>Line {line}</div>} */}
    </div>
  );
}
