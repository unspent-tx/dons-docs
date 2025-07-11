import SourceBadge from "./source-badge";

interface ItemHeaderProps {
  name: string;
  source: "stdlib" | "prelude" | "vodka";
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
      <div>
        <h4 className="text-3xl font-bold text-pink-300">{name}</h4>
        <SourceBadge source={source} />
        {/* {badges &&
          badges.map((badge, index) => <span key={index}>{badge}</span>)} */}
      </div>
      {/* {line && <div>Line {line}</div>} */}
    </div>
  );
}
