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

interface SearchFiltersProps {
  toggleGlobalCodeBlocks: () => void;
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sourceFilter: "all" | "stdlib" | "prelude" | "vodka" | "anastasia";
  setSourceFilter: (
    filter: "all" | "stdlib" | "prelude" | "vodka" | "anastasia"
  ) => void;
  sourceCounts: {
    all: number;
    stdlib: number;
    prelude: number;
    vodka: number;
    anastasia: number;
  };
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
  const sourceOptions = [
    { value: "all", label: "All Sources", icon: IconPackage },
    { value: "stdlib", label: "Standard Library", icon: IconBook },
    { value: "prelude", label: "Prelude", icon: IconCode },
    { value: "vodka", label: "Vodka", icon: IconBrandTabler },
    { value: "anastasia", label: "Anastasia Design Patterns", icon: IconCode },
  ] as const;

  return (
    <div className="flex flex-col gap-5 w-full">
      <div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={toggleGlobalCodeBlocks}
            className={`max-w-44 px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
              !showCodeBlocksByDefault
                ? "button-1"
                : "button-1 !bg-neutral-900 !text-pink-300"
            }`}
          >
            {showCodeBlocksByDefault ? (
              <>
                <IconBracketsOff size={16} />
                Hide code
              </>
            ) : (
              <>
                <IconBrackets size={16} />
                Show code
              </>
            )}
          </button>
          {sourceOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setSourceFilter(option.value)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  sourceFilter === option.value
                    ? "button-1"
                    : "button-1 !bg-neutral-900 !text-pink-300"
                }`}
              >
                <IconComponent size={16} />
                {option.label} ({sourceCounts[option.value]})
              </button>
            );
          })}
        </div>
      </div>
      <div className=" w-full relative">
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
