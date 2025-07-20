import {
  IconBook,
  IconCode,
  IconBrandTabler,
  IconPackage,
  IconBracketsOff,
  IconBrackets,
  IconX,
  IconFile,
  IconDownload,
  IconDownloadOff,
  IconFilterOff,
  IconChevronDown,
  IconFunction,
  IconBraces,
  IconAtom,
  IconFilter,
  IconLayoutGrid,
  IconLayoutList,
} from "@tabler/icons-react";
import { getSortedPackages, SourceType } from "../lib/client-registry";
import GridToggleButton, { GridSize } from "./grid-toggle-button";
import RadioButtonGroup from "./ui/radio-button-group";
import ToggleGroup from "./ui/toggle-group";
import ActionButton from "./ui/action-button";
import SearchInput from "./ui/search-input";
import { useState } from "react";

interface SearchFiltersProps {
  toggleGlobalCodeBlocks: () => void;
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  toggleGlobalImports: () => void;
  showImportsByDefault: boolean;
  expandedImports: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sourceFilter: "all" | SourceType;
  setSourceFilter: (filter: "all" | SourceType) => void;
  sourceCounts: Record<string, number>;
  moduleFilter: string;
  setModuleFilter: (filter: string) => void;
  onGridSizeChange: (gridSize: GridSize) => void;
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

export default function SearchFilters({
  toggleGlobalCodeBlocks,
  showCodeBlocksByDefault,
  expandedCodeBlocks,
  toggleGlobalImports,
  showImportsByDefault,
  expandedImports,
  searchQuery,
  setSearchQuery,
  sourceFilter,
  setSourceFilter,
  sourceCounts,
  moduleFilter,
  setModuleFilter,
  onGridSizeChange,
  activeTab,
  setActiveTab,
  tabCounts,
}: SearchFiltersProps) {
  const [isClearingFilters, setIsClearingFilters] = useState(false);
  const [currentGridSize, setCurrentGridSize] = useState<GridSize>("4");
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

  // Tab options for radio buttons
  const tabOptions = [
    {
      value: "functions",
      label: "Functions",
      icon: IconFunction,
      count: tabCounts.functions,
    },
    {
      value: "types",
      label: "Types",
      icon: IconBraces,
      count: tabCounts.types,
    },
    { value: "atoms", label: "Atoms", icon: IconAtom, count: tabCounts.atoms },
    {
      value: "modules",
      label: "Modules",
      icon: IconPackage,
      count: tabCounts.modules,
    },
  ];

  // Source options for radio buttons
  const sourceOptions = [
    {
      value: "all",
      label: "All Sources",
      icon: IconPackage,
      count: sourceCounts.all || 0,
    },
    ...getSortedPackages().map((pkg) => ({
      value: pkg.id,
      label: pkg.name,
      icon: getIconForPackage(pkg.icon),
      count: sourceCounts[pkg.id] || 0,
    })),
  ];

  const hasActiveFilters =
    searchQuery || sourceFilter !== "all" || moduleFilter;

  // Display options for toggles
  const displayOptions = [
    {
      id: "code-blocks",
      label: "Show code",
      icon: showCodeBlocksByDefault ? IconBracketsOff : IconBrackets,
      checked: showCodeBlocksByDefault,
      onToggle: toggleGlobalCodeBlocks,
    },
    {
      id: "imports",
      label: "Show imports",
      icon: showImportsByDefault ? IconDownloadOff : IconDownload,
      checked: showImportsByDefault,
      onToggle: toggleGlobalImports,
    },
    ...(moduleFilter
      ? [
          {
            id: "module-filter",
            label: `Module: ${moduleFilter}`,
            icon: IconFilter,
            checked: true,
            onToggle: (checked: boolean) => {
              if (!checked) {
                setModuleFilter("");
              }
            },
          },
        ]
      : []),
    {
      id: "clear-filters",
      label: "Clear all filters",
      icon: IconFilterOff,
      checked: isClearingFilters,
      onToggle: (checked: boolean) => {
        if (checked) {
          setIsClearingFilters(true);
          setTimeout(() => {
            setSearchQuery("");
            setSourceFilter("all");
            setModuleFilter("");
            setActiveTab("functions");
            setIsClearingFilters(false);
          }, 400);
        }
      },
    },
    {
      id: "grid-toggle",
      label: `Grid ${currentGridSize === "flex" ? "Flex" : currentGridSize}`,
      icon: currentGridSize === "flex" ? IconLayoutList : IconLayoutGrid,
      checked: false,
      onToggle: (checked: boolean) => {
        if (checked) {
          const newGridSize = (() => {
            switch (currentGridSize) {
              case "1":
                return "2";
              case "2":
                return "3";
              case "3":
                return "4";
              case "4":
                return "flex";
              case "flex":
                return "1";
              default:
                return "4";
            }
          })();
          setCurrentGridSize(newGridSize);
          onGridSizeChange(newGridSize);
        }
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Selection */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-3">
          <h3 className="text-sm font-medium text-neutral-300 mb-3 sr-only">
            Search
          </h3>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search functions, types, modules..."
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-neutral-300 mb-3">
            I want to see
          </h3>
          <RadioButtonGroup
            options={tabOptions}
            value={activeTab}
            onChange={(value) =>
              setActiveTab(
                value as
                  | "modules"
                  | "functions"
                  | "atoms"
                  | "types"
                  | "constants"
              )
            }
            name="content-tabs"
          />
        </div>

        {/* Source Filter */}
        <div>
          <h3 className="text-sm font-medium text-neutral-300 mb-3">From</h3>
          <RadioButtonGroup
            options={sourceOptions}
            value={sourceFilter}
            onChange={setSourceFilter}
            name="source-filter"
          />
        </div>

        {/* Display Options */}
        <div>
          <h3 className="text-sm font-medium text-neutral-300 mb-3">
            Display Options
          </h3>
          <div className="flex flex-wrap gap-4">
            <ToggleGroup options={displayOptions} />
          </div>
        </div>
      </div>

      {/* Search */}
    </div>
  );
}
