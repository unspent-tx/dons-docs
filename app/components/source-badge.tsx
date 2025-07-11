interface SourceBadgeProps {
  source: "stdlib" | "prelude" | "vodka";
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  return <span>{source}</span>;
}
