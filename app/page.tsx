"use client";

import { useState, useEffect } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import LoadingSpinner from "./components/loading-spinner";
import ErrorMessage from "./components/error-message";
import Header from "./components/header";
import StatsGrid from "./components/stats-grid";
import SearchFilters from "./components/search-filters";
import TabNavigation from "./components/tab-navigation";
import Overview from "./components/overview";
import ModulesView from "./components/modules-view";
import FunctionsView from "./components/functions-view";
import AtomsView from "./components/atoms-view";
import TypesView from "./components/types-view";
import ConstantsView from "./components/constants-view";
import Footer from "./components/footer";
import GridToggleButton, {
  getGridClasses,
  GridSize,
} from "./components/grid-toggle-button";
import CodeBlocksToggleButton from "./components/code-blocks-toggle-button";
import ImportsToggleButton from "./components/imports-toggle-button";
import FileStructureSidebar from "./components/file-structure-sidebar";
import { SourceType, getSortedPackages } from "./lib/client-registry";
import { loadAikenData, type AikenData } from "./lib/data";

interface LibraryData {
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
  modules: Array<{
    key: string;
    name: string;
    source: SourceType;
    functions: number;
    atoms: number;
    types: number;
    privateTypes: number;
    constants: number;
    privateConstants: number;
    dependencies: number;
    isReExportFile?: boolean;
    reExportedAs?: string[];
  }>;
  functions: Array<{
    fullName: string;
    name: string;
    signature: string;
    documentation?: string;
    parameters: Array<{
      name: string;
      type: string;
      optional?: boolean;
    }>;
    returnType: string;
    line: number;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
  }>;
  atoms: Array<{
    fullName: string;
    name: string;
    signature: string;
    documentation?: string;
    parameters: Array<{
      name: string;
      type: string;
      optional?: boolean;
    }>;
    returnType: string;
    line: number;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
  }>;
  types: Array<{
    fullName: string;
    name: string;
    definition: string;
    line: number;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
  }>;
  privateTypes: Array<{
    fullName: string;
    name: string;
    definition: string;
    line: number;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
  }>;
  constants: Array<{
    fullName: string;
    name: string;
    type: string;
    value: string;
    line: number;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
  }>;
  privateConstants: Array<{
    fullName: string;
    name: string;
    type: string;
    value: string;
    line: number;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
  }>;
}

export default function Home() {
  const [data, setData] = useState<AikenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "modules" | "functions" | "atoms" | "types" | "constants"
  >("functions");
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState<"all" | SourceType>("all");
  const [moduleFilter, setModuleFilter] = useState<string>("");

  // Code block visibility controls
  const [showCodeBlocksByDefault, setShowCodeBlocksByDefault] = useState(true);
  const [expandedCodeBlocks, setExpandedCodeBlocks] = useState<Set<string>>(
    new Set()
  );

  // Import block visibility controls
  const [showImportsByDefault, setShowImportsByDefault] = useState(true);
  const [expandedImports, setExpandedImports] = useState<Set<string>>(
    new Set()
  );

  // Grid size controls
  const [gridSize, setGridSize] = useState<GridSize>("4");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleCodeBlock = (id: string) => {
    setExpandedCodeBlocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleImportBlock = (id: string) => {
    setExpandedImports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleCodeBlocksToggle = (showCodeBlocks: boolean) => {
    setShowCodeBlocksByDefault(showCodeBlocks);
    // Clear individual expansions when toggling global setting
    setExpandedCodeBlocks(new Set());
  };

  const handleImportsToggle = (showImports: boolean) => {
    setShowImportsByDefault(showImports);
    // Clear individual expansions when toggling global setting
    setExpandedImports(new Set());
  };

  const handleSearchFiltersCodeBlocksToggle = () => {
    setShowCodeBlocksByDefault((prev) => !prev);
    // Clear individual expansions when toggling global setting
    setExpandedCodeBlocks(new Set());
  };

  const handleSearchFiltersImportsToggle = () => {
    setShowImportsByDefault((prev) => !prev);
    // Clear individual expansions when toggling global setting
    setExpandedImports(new Set());
  };

  const handleGridSizeChange = (newGridSize: GridSize) => {
    setGridSize(newGridSize);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await loadAikenData();
      setData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await fetchData();
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh data");
    } finally {
      setLoading(false);
    }
  };

  const filterItems = (
    items: any[],
    query: string,
    sourceFilter: string,
    moduleFilter: string = ""
  ) => {
    let filtered = items;

    // Apply source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((item) => item.source === sourceFilter);
    }

    // Apply module filter
    if (moduleFilter) {
      filtered = filtered.filter((item) => {
        // Check if the item belongs to the specified module
        // For functions, atoms, types, constants, check if their fullName starts with the module
        if (item.fullName) {
          return item.fullName.startsWith(moduleFilter);
        }
        // For modules themselves, check if the key matches
        if (item.key) {
          return item.key === moduleFilter;
        }
        return false;
      });
    }

    // Apply search query
    if (query.trim()) {
      const lowercaseQuery = query.toLowerCase();

      // Score each item for relevance
      const scoredItems = filtered.map((item) => {
        const searchableFields = [
          { text: item.name?.toLowerCase() || "", weight: 10 },
          { text: item.fullName?.toLowerCase() || "", weight: 5 },
          { text: item.signature?.toLowerCase() || "", weight: 3 },
          { text: item.documentation?.toLowerCase() || "", weight: 1 },
        ];

        let score = 0;
        let hasMatch = false;

        searchableFields.forEach(({ text, weight }) => {
          // Handle multi-word queries by treating underscores as spaces
          const normalizedText = text.replace(/_/g, " ");
          const normalizedQuery = lowercaseQuery.replace(/_/g, " ");

          // Exact substring match (highest priority)
          if (
            text.includes(lowercaseQuery) ||
            normalizedText.includes(normalizedQuery)
          ) {
            score += weight * 100;
            hasMatch = true;

            // Enhanced scoring for better relevance

            // Bonus for exact word match
            if (text === lowercaseQuery || normalizedText === normalizedQuery) {
              score += weight * 500;
            }
            // Bonus for starts with match
            else if (
              text.startsWith(lowercaseQuery) ||
              normalizedText.startsWith(normalizedQuery)
            ) {
              score += weight * 300;
            }
            // Bonus for ends with match
            else if (
              text.endsWith(lowercaseQuery) ||
              normalizedText.endsWith(normalizedQuery)
            ) {
              score += weight * 250;
            }
            // Bonus for word boundary matches
            else if (
              text.includes("_" + lowercaseQuery) ||
              text.includes(lowercaseQuery + "_")
            ) {
              score += weight * 200;
            }

            // Bonus based on how much of the result name is the search term
            const matchRatio = Math.max(
              lowercaseQuery.length / text.length,
              normalizedQuery.length / normalizedText.length
            );
            score += weight * 100 * matchRatio;

            // Bonus for match position - earlier matches score higher
            const matchIndex = Math.min(
              text.indexOf(lowercaseQuery) >= 0
                ? text.indexOf(lowercaseQuery)
                : 999,
              normalizedText.indexOf(normalizedQuery) >= 0
                ? normalizedText.indexOf(normalizedQuery)
                : 999
            );
            if (matchIndex < 999) {
              const positionBonus = Math.max(0, 50 - matchIndex * 2);
              score += weight * positionBonus;
            }
          }

          // Multi-word query handling - check if all words in query match
          const queryWords = lowercaseQuery.split(/\s+/);
          if (queryWords.length > 1) {
            const textWords = text.split(/[\s_\-\.]+/);
            const allWordsMatch = queryWords.every((queryWord: string) =>
              textWords.some(
                (textWord: string) =>
                  textWord.includes(queryWord) || textWord.startsWith(queryWord)
              )
            );

            if (allWordsMatch) {
              score += weight * 400; // High bonus for multi-word complete matches
              hasMatch = true;

              // Extra bonus if words appear in the same order
              let orderBonus = 0;
              let lastIndex = -1;
              let inOrder = true;

              for (const queryWord of queryWords) {
                const foundIndex = textWords.findIndex(
                  (textWord: string, index: number) =>
                    index > lastIndex &&
                    (textWord.includes(queryWord) ||
                      textWord.startsWith(queryWord))
                );
                if (foundIndex > lastIndex) {
                  lastIndex = foundIndex;
                } else {
                  inOrder = false;
                  break;
                }
              }

              if (inOrder) {
                orderBonus = weight * 200;
                score += orderBonus;
              }
            }
          }

          // Word boundary matching (fallback)
          else {
            const queryWords = lowercaseQuery.split(/\s+/);
            const fieldWords = text.split(/[\s_\-\.]+/);

            queryWords.forEach((queryWord: string) => {
              if (queryWord.length >= 3) {
                fieldWords.forEach((fieldWord: string) => {
                  if (fieldWord.startsWith(queryWord)) {
                    if (queryWord.length >= fieldWord.length * 0.5) {
                      score += weight * 20;
                      hasMatch = true;

                      const wordMatchRatio =
                        queryWord.length / fieldWord.length;
                      score += weight * 10 * wordMatchRatio;
                    }
                  }
                });
              }
            });
          }
        });

        return { item, score, hasMatch };
      });

      // Filter out items with no matches and sort by score
      filtered = scoredItems
        .filter(({ hasMatch }) => hasMatch)
        .sort((a, b) => b.score - a.score)
        .map(({ item }) => item);
    }

    return filtered;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!data) {
    return (
      <div>
        <div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  // Calculate filtered results
  const allFilteredModules = filterItems(
    data.modules,
    searchQuery,
    sourceFilter,
    moduleFilter
  );
  const allFilteredFunctions = filterItems(
    data.functions,
    searchQuery,
    sourceFilter,
    moduleFilter
  );
  const allFilteredAtoms = filterItems(
    data.atoms,
    searchQuery,
    sourceFilter,
    moduleFilter
  );
  const allFilteredTypes = filterItems(
    data.types,
    searchQuery,
    sourceFilter,
    moduleFilter
  );
  const allFilteredPrivateTypes = filterItems(
    data.privateTypes,
    searchQuery,
    sourceFilter,
    moduleFilter
  );
  const allFilteredConstants = filterItems(
    data.constants,
    searchQuery,
    sourceFilter,
    moduleFilter
  );
  const allFilteredPrivateConstants = filterItems(
    data.privateConstants,
    searchQuery,
    sourceFilter,
    moduleFilter
  );

  // Calculate total counts for tabs
  const tabCounts = {
    modules: allFilteredModules.length,
    functions: allFilteredFunctions.length,
    atoms: allFilteredAtoms.length,
    types: allFilteredTypes.length + allFilteredPrivateTypes.length,
    constants: allFilteredConstants.length + allFilteredPrivateConstants.length,
  };

  // Calculate source-specific counts for filter buttons
  const sourceCounts = {
    all:
      allFilteredModules.length +
      allFilteredFunctions.length +
      allFilteredAtoms.length +
      allFilteredTypes.length +
      allFilteredPrivateTypes.length +
      allFilteredConstants.length +
      allFilteredPrivateConstants.length,
    ...getSortedPackages().reduce((acc, pkg) => {
      acc[pkg.id] =
        allFilteredModules.filter((item) => item.source === pkg.id).length +
        allFilteredFunctions.filter((item) => item.source === pkg.id).length +
        allFilteredAtoms.filter((item) => item.source === pkg.id).length +
        allFilteredTypes.filter((item) => item.source === pkg.id).length +
        allFilteredPrivateTypes.filter((item) => item.source === pkg.id)
          .length +
        allFilteredConstants.filter((item) => item.source === pkg.id).length +
        allFilteredPrivateConstants.filter((item) => item.source === pkg.id)
          .length;
      return acc;
    }, {} as Record<SourceType, number>),
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <FileStructureSidebar
        modules={data.modules}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onSearchChange={(query, source, itemType, moduleKey) => {
          setSearchQuery(query);
          setSourceFilter(source as SourceType);
          setModuleFilter(moduleKey || "");

          // Set the appropriate tab based on item type
          if (itemType === "function") {
            setActiveTab("functions");
          } else if (itemType === "type") {
            setActiveTab("types");
          } else if (itemType === "module") {
            setActiveTab("modules");
          }
        }}
      />
      <div
        className={`${sidebarOpen ? "ml-80" : ""} transition-all duration-300`}
      >
        <div className="m-5 lg:m-10">
          <div className="flex-1">
            <Header
              stats={data.stats}
              onRefresh={handleRefresh}
              isLoading={loading}
            />

            <div className="bg-pink-900/20 p-10 -mt-10 -mx-10 mb-10 ">
              <div className="space-y-6">
                <div>
                  <SearchFilters
                    toggleGlobalCodeBlocks={handleSearchFiltersCodeBlocksToggle}
                    showCodeBlocksByDefault={showCodeBlocksByDefault}
                    expandedCodeBlocks={expandedCodeBlocks}
                    toggleGlobalImports={handleSearchFiltersImportsToggle}
                    showImportsByDefault={showImportsByDefault}
                    expandedImports={expandedImports}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    sourceFilter={sourceFilter}
                    setSourceFilter={setSourceFilter}
                    sourceCounts={sourceCounts}
                    moduleFilter={moduleFilter}
                    setModuleFilter={setModuleFilter}
                    onGridSizeChange={handleGridSizeChange}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    tabCounts={tabCounts}
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {/* {activeTab === "overview" && <Overview />} */}
              {activeTab === "modules" && (
                <div className={getGridClasses(gridSize)}>
                  <ModulesView
                    modules={allFilteredModules}
                    showCodeBlocksByDefault={showCodeBlocksByDefault}
                    expandedCodeBlocks={expandedCodeBlocks}
                    toggleCodeBlock={toggleCodeBlock}
                    onModuleClick={(module) => {
                      setSearchQuery("");
                      setSourceFilter(module.source as SourceType);
                      setModuleFilter(module.key);
                      setActiveTab("functions");
                    }}
                  />
                </div>
              )}
              {activeTab === "functions" && (
                <div className={getGridClasses(gridSize)}>
                  <FunctionsView
                    functions={allFilteredFunctions}
                    showCodeBlocksByDefault={showCodeBlocksByDefault}
                    expandedCodeBlocks={expandedCodeBlocks}
                    toggleCodeBlock={toggleCodeBlock}
                    showImportsByDefault={showImportsByDefault}
                    expandedImports={expandedImports}
                    toggleImportBlock={toggleImportBlock}
                  />
                </div>
              )}
              {activeTab === "atoms" && (
                <div className={getGridClasses(gridSize)}>
                  <AtomsView
                    atoms={allFilteredAtoms}
                    showCodeBlocksByDefault={showCodeBlocksByDefault}
                    expandedCodeBlocks={expandedCodeBlocks}
                    toggleCodeBlock={toggleCodeBlock}
                    showImportsByDefault={showImportsByDefault}
                    expandedImports={expandedImports}
                    toggleImportBlock={toggleImportBlock}
                  />
                </div>
              )}
              {activeTab === "types" && (
                <div className={getGridClasses(gridSize)}>
                  <TypesView
                    types={allFilteredTypes}
                    privateTypes={allFilteredPrivateTypes}
                    showCodeBlocksByDefault={showCodeBlocksByDefault}
                    expandedCodeBlocks={expandedCodeBlocks}
                    toggleCodeBlock={toggleCodeBlock}
                  />
                </div>
              )}
              {activeTab === "constants" && (
                <div className={getGridClasses(gridSize)}>
                  <ConstantsView
                    constants={allFilteredConstants}
                    privateConstants={allFilteredPrivateConstants}
                    showCodeBlocksByDefault={showCodeBlocksByDefault}
                    expandedCodeBlocks={expandedCodeBlocks}
                    toggleCodeBlock={toggleCodeBlock}
                  />
                </div>
              )}
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
