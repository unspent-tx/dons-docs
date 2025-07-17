import {
  IconSearch,
  IconBook,
  IconCode,
  IconBrandTabler,
  IconPackage,
  IconEyeOff,
  IconEye,
  IconBracketsOff,
  IconBrackets,
} from "@tabler/icons-react";
import { getSortedPackages, SourceType } from "../lib/client-registry";

interface SearchFiltersProps {
  toggleGlobalCodeBlocks: () => void;
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sourceFilter: "all" | SourceType;
  setSourceFilter: (filter: "all" | SourceType) => void;
  sourceCounts: Record<string, number>;
}

export default function SearchFilters({
  toggleGlobalCodeBlocks,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  searchQuery,
  setSearchQuery,
  sourceFilter,
  setSourceFilter,
  sourceCounts,
}: SearchFiltersProps) {
  const getIconForPackage = (iconName?: string) => {
    switch (iconName) {
      case "IconBook":
        return IconBook;
      case "IconCode":
        return IconCode;
      case "IconBrandTabler":
        return IconBrandTabler;
      default:
        return IconCode;
    }
  };

  const sourceOptions = [
    { value: "all", label: "All Sources", icon: IconPackage },
    ...getSortedPackages().map((pkg) => ({
      value: pkg.id,
      label: pkg.name,
      icon: getIconForPackage(pkg.icon),
    })),
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {sourceOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <button
              key={option.value}
              onClick={() =>
                setSourceFilter(option.value as "all" | SourceType)
              }
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                sourceFilter === option.value
                  ? "button-1"
                  : "button-1 !bg-neutral-900 !text-pink-300"
              }`}
            >
              <IconComponent size={16} />
              {option.label} ({sourceCounts[option.value] || 0})
            </button>
          );
        })}
      </div>
      <h3 className="text-sm font-medium text-neutral-300 mb-3">Filter</h3>

      <div className="w-full relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <IconSearch size={20} className="text-gray-400" />
        </div>
        <input
          className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-pink-300 bg-transparent text-pink-400 shadow-sm placeholder-gray-400 transition"
          type="text"
          placeholder="Search functions, types, modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}
