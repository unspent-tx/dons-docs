import { IconRefresh } from "@tabler/icons-react";

interface HeaderProps {
  stats: {
    totalModules: number;
    totalFunctions: number;
    totalAtoms: number;
    totalTypes: number;
    totalConstants: number;
  };
  onRefresh: () => void;
  isLoading: boolean;
}

export default function Header({ stats, onRefresh, isLoading }: HeaderProps) {
  return (
    <div className="m-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="font-bold whitespace-nowrap text-7xl text-neutral-300">
              Don's Docs
            </h1>
          </div>
          <div className="text-4xl font-mono text-neutral-400">
            {stats.totalModules} <span className="text-sm">modules</span> •{" "}
            {stats.totalFunctions} <span className="text-sm">functions</span> •{" "}
            {stats.totalTypes} <span className="text-sm">types</span> •{" "}
            {stats.totalConstants} <span className="text-sm">constants</span>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`button-1 px-4 py-2 flex items-center gap-2 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <IconRefresh size={18} className={isLoading ? "animate-spin" : ""} />
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}
