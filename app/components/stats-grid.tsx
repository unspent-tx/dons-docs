import StatCard from "./stat-card";
import SectionTitle from "./section-title";

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
      stdlib: {
        modules: number;
        functions: number;
        atoms: number;
        types: number;
        privateTypes: number;
        constants: number;
        privateConstants: number;
      };
      prelude: {
        modules: number;
        functions: number;
        atoms: number;
        types: number;
        privateTypes: number;
        constants: number;
        privateConstants: number;
      };
      vodka: {
        modules: number;
        functions: number;
        atoms: number;
        types: number;
        privateTypes: number;
        constants: number;
        privateConstants: number;
      };
      anastasia: {
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
        <StatCard
          title="Std Lib"
          items={[
            { label: "Modules", value: stats.sourceStats.stdlib.modules },
            { label: "Functions", value: stats.sourceStats.stdlib.functions },
            { label: "Atoms", value: stats.sourceStats.stdlib.atoms },
            { label: "Types", value: stats.sourceStats.stdlib.types },
            { label: "Constants", value: stats.sourceStats.stdlib.constants },
          ]}
        />

        <StatCard
          title="Prelude"
          items={[
            { label: "Modules", value: stats.sourceStats.prelude.modules },
            { label: "Functions", value: stats.sourceStats.prelude.functions },
            { label: "Atoms", value: stats.sourceStats.prelude.atoms },
            { label: "Types", value: stats.sourceStats.prelude.types },
            { label: "Constants", value: stats.sourceStats.prelude.constants },
          ]}
        />

        <StatCard
          title="Vodka"
          items={[
            { label: "Modules", value: stats.sourceStats.vodka.modules },
            { label: "Functions", value: stats.sourceStats.vodka.functions },
            { label: "Atoms", value: stats.sourceStats.vodka.atoms },
            { label: "Types", value: stats.sourceStats.vodka.types },
            { label: "Constants", value: stats.sourceStats.vodka.constants },
          ]}
        />

        <StatCard
          title="Design Patterns"
          items={[
            { label: "Modules", value: stats.sourceStats.anastasia.modules },
            {
              label: "Functions",
              value: stats.sourceStats.anastasia.functions,
            },
            { label: "Atoms", value: stats.sourceStats.anastasia.atoms },
            { label: "Types", value: stats.sourceStats.anastasia.types },
            {
              label: "Constants",
              value: stats.sourceStats.anastasia.constants,
            },
          ]}
        />
      </div>
    </div>
  );
}
