import StatCard from "./stat-card";
import SectionTitle from "./section-title";
import { getSortedPackages, SourceType } from "../lib/client-registry";

interface StatsGridProps {
  stats: {
    totalModules: number;
    totalFunctions: number;
    totalAtoms: number;
    totalTypes: number;
    totalPrivateTypes: number;
    totalConstants: number;
    totalPrivateConstants: number;
    sourceStats: {
      [K in SourceType]: {
        modules: number;
        functions: number;
        atoms: number;
        types: number;
        privateTypes: number;
        constants: number;
        privateConstants: number;
      };
    };
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="m-5">
      <div className="flex flex-wrap gap-10">
        {getSortedPackages().map((pkg) => (
          <StatCard
            key={pkg.id}
            title={pkg.name}
            items={[
              { label: "Modules", value: stats.sourceStats[pkg.id].modules },
              {
                label: "Functions",
                value: stats.sourceStats[pkg.id].functions,
              },
              { label: "Atoms", value: stats.sourceStats[pkg.id].atoms },
              { label: "Types", value: stats.sourceStats[pkg.id].types },
              {
                label: "Constants",
                value: stats.sourceStats[pkg.id].constants,
              },
            ]}
          />
        ))}
      </div>
    </div>
  );
}
