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
        <SourceBadge source={source} />
        <h4 className="text-xl font-bold text-pink-300">{name}</h4>
        {/* {badges &&
          badges.map((badge, index) => <span key={index}>{badge}</span>)} */}
      </div>
      {/* {line && <div>Line {line}</div>} */}
    </div>
  );
}
