interface SourceBadgeProps {
  source: string;
}

export default function SourceBadge({ source }: SourceBadgeProps) {
  return <span className="text-xs">{source}</span>;
}
