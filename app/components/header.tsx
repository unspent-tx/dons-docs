import { IconRefresh } from "@tabler/icons-react";
import StatsGrid from "./stats-grid";

interface HeaderProps {
  stats: any;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function Header({ stats, onRefresh, isLoading }: HeaderProps) {
  return <div className=""></div>;
}
