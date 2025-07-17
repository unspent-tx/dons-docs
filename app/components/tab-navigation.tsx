import {
  IconHome,
  IconPackage,
  IconFunction,
  IconAtom,
  IconBraces,
  IconVariable,
} from "@tabler/icons-react";

interface TabNavigationProps {
  activeTab: "modules" | "functions" | "atoms" | "types" | "constants";
  setActiveTab: (
    tab: "modules" | "functions" | "atoms" | "types" | "constants"
  ) => void;
  tabCounts: {
    modules: number;
    functions: number;
    atoms: number;
    types: number;
    constants: number;
  };
}

export default function TabNavigation({
  activeTab,
  setActiveTab,
  tabCounts,
}: TabNavigationProps) {
  const tabs = [
    {
      key: "functions",
      label: "Functions",
      count: tabCounts.functions,
      icon: IconFunction,
    },
    { key: "types", label: "Types", count: tabCounts.types, icon: IconBraces },
    { key: "atoms", label: "Atoms", count: tabCounts.atoms, icon: IconAtom },
    {
      key: "modules",
      label: "Modules",
      count: tabCounts.modules,
      icon: IconPackage,
    },
  ] as const;

  return (
    <nav className="flex flex-wrap gap-3">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <button
            className={`button-1 flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "button-1"
                : "button-1 !bg-neutral-900 !text-pink-300"
            }`}
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
          >
            <IconComponent size={16} />
            {tab.label}
            {tab.count !== null && (
              <span className="font-mono"> ({tab.count})</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
