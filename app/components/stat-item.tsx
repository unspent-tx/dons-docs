interface StatItemProps {
  label: string;
  value: number;
}

export default function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-pink-200 w-10 font-mono">
        {value}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
