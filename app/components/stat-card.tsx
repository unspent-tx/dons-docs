import StatItem from "./stat-item";
import { IconCheck, IconCircleCheck } from "@tabler/icons-react";

interface StatCardProps {
  title: string;
  items: Array<{ label: string; value: number }>;
}

export default function StatCard({ title, items }: StatCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xl font-thin flex items-center gap-2">
        <IconCircleCheck className="w-8 h-8 text-pink-300" />
        {title}
      </h3>
    </div>
  );
}
