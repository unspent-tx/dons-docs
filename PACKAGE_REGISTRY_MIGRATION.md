# Package Registry Migration Guide

## Overview

This guide outlines the migration from hardcoded package management to a dynamic registry-based system. The goal is to make adding new packages seamless while preserving all existing parsing logic and special handling.

## Current Pain Points

Adding a new package currently requires manual updates to:

- TypeScript interfaces (7+ files)
- SDK constructor and methods
- Parser method signatures
- API route configuration
- Copy script logic
- UI components (filters, stats, etc.)
- Main page interfaces and source counts

## Proposed Solution: Registry-Based Architecture

### Core Principles

1. **Preserve All Parsing Logic**: No changes to existing parsing methods
2. **Support Unique Parsing Requirements**: Each package can have custom parsing logic
3. **Single Source of Truth**: All package configuration in one registry file
4. **Dynamic Generation**: UI, types, and configuration generated from registry
5. **Backward Compatibility**: Existing code continues to work during migration
6. **Extensible Architecture**: Easy to add new parsing strategies for unique packages

## Implementation Plan

### Phase 1: Create Registry Foundation

#### 1.1 Create Package Registry File

**File**: `packages/aiken-sdk/src/registry.ts`

```typescript
export interface PackageConfig {
  id: string; // Unique identifier (e.g., "stdlib", "anastasia")
  name: string; // Display name ("Standard Library", "Design Patterns")
  description?: string; // Optional description
  icon?: string; // Icon identifier for UI
  path: string; // Relative path to package source
  publicPath: string; // Path in public directory
  enabled: boolean; // Whether to include in builds
  priority: number; // Order in UI (lower = higher priority)
  parsingStrategy: "stdlib" | "prelude" | "vodka" | "anastasia"; // Existing parsing logic to use
  customParsing?: {
    // Optional custom parsing configuration for unique package requirements
    specialHandling?: string[]; // e.g., ["re-exports", "custom-imports", "special-types"]
    parserExtensions?: string[]; // Additional parser methods to call
    postProcessing?: string[]; // Post-processing steps after parsing
  };
}

export const PACKAGE_REGISTRY: PackageConfig[] = [
  {
    id: "stdlib",
    name: "Standard Library",
    description: "Core Aiken standard library",
    icon: "IconBook",
    path: "packages/aiken-stdlib",
    publicPath: "public/aiken-lib/aiken-stdlib",
    enabled: true,
    priority: 1,
    parsingStrategy: "stdlib",
  },
  {
    id: "prelude",
    name: "Prelude",
    description: "Aiken prelude library",
    icon: "IconCode",
    path: "packages/aiken-prelude/lib",
    publicPath: "public/aiken-lib/aiken-prelude",
    enabled: true,
    priority: 2,
    parsingStrategy: "prelude",
  },
  {
    id: "vodka",
    name: "Vodka",
    description: "Vodka library with re-exports",
    icon: "IconBrandTabler",
    path: "packages/aiken-vodka/lib",
    publicPath: "public/aiken-lib/aiken-vodka",
    enabled: true,
    priority: 3,
    parsingStrategy: "vodka",
    customParsing: {
      specialHandling: ["re-exports"],
      postProcessing: ["processVodkaReExports"],
    },
  },
  {
    id: "anastasia",
    name: "Design Patterns",
    description: "Anastasia Labs design patterns",
    icon: "IconCode",
    path: "packages/aiken-design-patterns/lib",
    publicPath: "public/aiken-lib/aiken-design-patterns",
    enabled: true,
    priority: 4,
    parsingStrategy: "anastasia",
  },
];

// Helper functions
export function getEnabledPackages(): PackageConfig[] {
  return PACKAGE_REGISTRY.filter((pkg) => pkg.enabled);
}

export function getPackageById(id: string): PackageConfig | undefined {
  return PACKAGE_REGISTRY.find((pkg) => pkg.id === id);
}

export function getSortedPackages(): PackageConfig[] {
  return getEnabledPackages().sort((a, b) => a.priority - b.priority);
}
```

#### 1.2 Update Types to Use Registry

**File**: `packages/aiken-sdk/src/types.ts`

```typescript
import { PACKAGE_REGISTRY } from "./registry.js";

// Generate source type from registry
export type SourceType = (typeof PACKAGE_REGISTRY)[number]["id"];

// Update all interfaces to use generated type
export interface AikenImport {
  module: string;
  items: string[];
  alias?: string;
  line: number;
  raw: string;
  source: SourceType; // Changed from hardcoded union
}

export interface AikenFunction {
  name: string;
  signature: string;
  documentation?: string;
  parameters: AikenParameter[];
  returnType: string;
  line: number;
  raw: string;
  isPublic: boolean;
  source: SourceType; // Changed from hardcoded union
  reExportedAs?: string[];
  implementation?: string;
  tests?: string[];
}

// ... Update all other interfaces similarly

export interface AikenLibrary {
  modules: Map<string, AikenModule>;
  dependencies: Map<string, string[]>;
  functions: Map<string, AikenFunction>;
  types: Map<string, AikenType>;
  constants: Map<string, AikenConstant>;
  atoms: Map<string, AikenFunction>;
  privateTypes: Map<string, AikenType>;
  privateConstants: Map<string, AikenConstant>;
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
}

export interface ParseOptions {
  includeTests?: boolean;
  includeComments?: boolean;
  followDependencies?: boolean;
  includePrivate?: boolean;
  sources?: SourceType[]; // Changed from hardcoded union
}
```

### Phase 2: Update SDK to Use Registry

#### 2.1 Modify SDK Constructor

**File**: `packages/aiken-sdk/src/sdk.ts`

```typescript
import {
  PACKAGE_REGISTRY,
  PackageConfig,
  getEnabledPackages,
} from "./registry.js";

export class AikenSDK {
  private packages: Map<string, PackageConfig>;
  private library: AikenLibrary;

  constructor(packageConfigs?: PackageConfig[]) {
    this.packages = new Map();
    const configs = packageConfigs || getEnabledPackages();

    configs.forEach((config) => {
      this.packages.set(config.id, config);
    });

    this.library = this.createEmptyLibrary(configs);
  }

  private createEmptyLibrary(configs: PackageConfig[]): AikenLibrary {
    const sourceStats: any = {};
    configs.forEach((config) => {
      sourceStats[config.id] = {
        modules: 0,
        functions: 0,
        atoms: 0,
        types: 0,
        privateTypes: 0,
        constants: 0,
        privateConstants: 0,
      };
    });

    return {
      modules: new Map(),
      dependencies: new Map(),
      functions: new Map(),
      types: new Map(),
      constants: new Map(),
      atoms: new Map(),
      privateTypes: new Map(),
      privateConstants: new Map(),
      sourceStats,
    };
  }

  async loadLibrary(options: ParseOptions = {}): Promise<void> {
    const sources = options.sources || Array.from(this.packages.keys());

    console.log(`Loading Aiken libraries from sources: ${sources.join(", ")}`);

    this.clearLibrary();

    // Load each package using existing parsing logic
    for (const source of sources) {
      const pkg = this.packages.get(source);
      if (pkg && pkg.enabled) {
        const sourcePath = join(process.cwd(), pkg.path);
        await this.loadSourceLibrary(
          pkg.parsingStrategy, // Use existing parsing strategy
          sourcePath,
          options
        );
      }
    }

    // Apply custom parsing and post-processing for each package
    for (const source of sources) {
      const pkg = this.packages.get(source);
      if (pkg?.customParsing?.postProcessing) {
        for (const postProcess of pkg.customParsing.postProcessing) {
          switch (postProcess) {
            case "processVodkaReExports":
              if (source === "vodka") {
                await this.processVodkaReExports();
              }
              break;
            // Add more post-processing steps as needed
            default:
              console.warn(`Unknown post-processing step: ${postProcess}`);
          }
        }
      }
    }
  }

  // All existing methods stay the same - just update signatures to use SourceType
  private async loadSourceLibrary(
    source: SourceType,
    sourcePath: string,
    options: ParseOptions
  ): Promise<void> {
    // Existing logic preserved
  }

  private async parseFile(
    filePath: string,
    basePath: string,
    source: SourceType,
    options: ParseOptions = {}
  ): Promise<AikenModule> {
    // Existing logic preserved
  }

  // Update method signatures but keep logic
  getModulesBySource(source: SourceType): Map<string, AikenModule> {
    // Existing logic preserved
  }

  getFunctionsBySource(source: SourceType): Map<string, any> {
    // Existing logic preserved
  }

  // ... update all other methods similarly
}
```

#### 2.2 Update SDK Factory

**File**: `packages/aiken-sdk/src/index.ts`

```typescript
import { AikenSDK } from "./sdk.js";
import { getEnabledPackages } from "./registry.js";

// Export main SDK class
export { AikenSDK } from "./sdk.js";

// Export parser utilities
export { AikenParser } from "./parser.js";

// Export all types
export type {
  AikenImport,
  AikenFunction,
  AikenParameter,
  AikenType,
  AikenConstant,
  AikenModule,
  AikenLibrary,
  ParseOptions,
  SourceType,
} from "./types.js";

// Export registry
export {
  PACKAGE_REGISTRY,
  PackageConfig,
  getEnabledPackages,
} from "./registry.js";

// Updated factory function
export function createAikenSDK(packageConfigs?: PackageConfig[]) {
  return new AikenSDK(packageConfigs);
}
```

### Phase 3: Update Copy Script

**File**: `scripts/copy-aiken-files.js`

```javascript
const fs = require("fs");
const path = require("path");

// Import registry (need to handle ESM/CommonJS)
const { PACKAGE_REGISTRY } = require("../packages/aiken-sdk/dist/registry.js");

async function copyPackages() {
  const publicDir = path.join(__dirname, "../public");
  const aikenLibDir = path.join(publicDir, "aiken-lib");

  // Ensure directories exist
  if (!fs.existsSync(aikenLibDir)) {
    fs.mkdirSync(aikenLibDir, { recursive: true });
  }

  // Copy packages from registry
  for (const pkg of PACKAGE_REGISTRY.filter((p) => p.enabled)) {
    const source = path.join(__dirname, "..", pkg.path);
    const target = path.join(__dirname, "..", pkg.publicPath);

    if (fs.existsSync(source)) {
      fs.cpSync(source, target, { recursive: true });
      console.log(`✓ Copied ${pkg.name} files`);
    } else {
      console.error(`✗ ${pkg.name} source not found:`, source);
    }
  }

  console.log("Aiken library files copied to public folder");
}

copyPackages().catch(console.error);
```

### Phase 4: Update API Route

**File**: `app/api/aiken-library/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createAikenSDK, getEnabledPackages } from "@dons-docs/aiken-sdk";
import { join } from "path";

let cachedData: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Return cached data if available and not expired
    if (cachedData && lastCacheTime > Date.now() - CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Get enabled packages from registry
    const enabledPackages = getEnabledPackages();
    const projectRoot = process.cwd();

    // Build package paths dynamically
    const packagePaths = enabledPackages.reduce((acc, pkg) => {
      acc[pkg.id] = join(projectRoot, pkg.publicPath);
      return acc;
    }, {} as Record<string, string>);

    // Initialize SDK with registry
    const sdk = createAikenSDK(enabledPackages);

    // Load library with all enabled sources
    await sdk.loadLibrary({
      sources: enabledPackages.map((pkg) => pkg.id),
      includePrivate: true,
    });

    // Get data from all sources (existing logic)
    const modules = sdk.getModules();
    const functions = sdk.getAllFunctions();
    const atoms = sdk.getAllAtoms();
    const types = sdk.getAllTypes();
    const privateTypes = sdk.getAllPrivateTypes();
    const constants = sdk.getAllConstants();
    const privateConstants = sdk.getAllPrivateConstants();
    const stats = sdk.getStats();

    // Convert Maps to arrays for JSON serialization (existing logic)
    const data = {
      modules: Array.from(modules.entries()).map(([key, module]) => ({
        key,
        ...module,
      })),
      functions: Array.from(functions.entries()).map(([key, func]) => ({
        key,
        fullName: key,
        ...func,
      })),
      // ... rest of existing conversion logic
      stats,
    };

    // Cache the data
    cachedData = data;
    lastCacheTime = Date.now();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading Aiken library:", error);
    return NextResponse.json(
      { error: "Failed to load library" },
      { status: 500 }
    );
  }
}

export async function POST() {
  // Existing refresh logic preserved
}
```

### Phase 5: Update UI Components

#### 5.1 Update Search Filters

**File**: `app/components/search-filters.tsx`

```typescript
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
import { getSortedPackages, SourceType } from "@dons-docs/aiken-sdk";

interface SearchFiltersProps {
  toggleGlobalCodeBlocks: () => void;
  showCodeBlocksByDefault: boolean;
  expandedCodeBlocks: Set<string>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sourceFilter: "all" | SourceType;
  setSourceFilter: (filter: "all" | SourceType) => void;
  sourceCounts: {
    all: number;
    [K in SourceType]: number;
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
      </div>
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
```

#### 5.2 Update Stats Grid

**File**: `app/components/stats-grid.tsx`

```typescript
import StatCard from "./stat-card";
import SectionTitle from "./section-title";
import { getSortedPackages, SourceType } from "@dons-docs/aiken-sdk";

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
```

### Phase 6: Update Main Page

**File**: `app/page.tsx`

```typescript
import { SourceType, getSortedPackages } from "@dons-docs/aiken-sdk";

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
  // ... update all other interfaces similarly
}

export default function Home() {
  const [sourceFilter, setSourceFilter] = useState<"all" | SourceType>("all");

  // ... existing state and logic

  // Calculate source-specific counts dynamically
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

  // ... rest of component logic
}
```

## Adding a New Package

With the registry system in place, adding a new package becomes simple:

### 1. Clone the Package

```bash
cd packages
git clone https://github.com/example/aiken-new-package.git
```

### 2. Determine Parsing Requirements

**Important**: Each package may have unique parsing requirements. Analyze the package to determine:

- **File structure**: How are files organized?
- **Special syntax**: Any custom Aiken syntax or patterns?
- **Import/export patterns**: Unique import/export mechanisms?
- **Re-exports**: Does it re-export from other packages?
- **Custom types**: Special type definitions or patterns?
- **Documentation format**: Unique documentation syntax?

### 3. Choose or Create Parsing Strategy

#### Option A: Use Existing Strategy

If the package follows standard patterns, use an existing strategy:

```typescript
{
  id: "new-package",
  name: "New Package",
  parsingStrategy: "anastasia", // Use existing strategy
  // ... other config
}
```

#### Option B: Create New Parsing Strategy

If the package has unique requirements:

1. **Add new parsing strategy to parser.ts**:

```typescript
// packages/aiken-sdk/src/parser.ts
export class AikenParser {
  // Add new parsing methods for the package
  static parseNewPackageSpecific(
    content: string,
    source: SourceType
  ): AikenFunction[] {
    // Custom parsing logic for the new package
  }

  static processNewPackageReExports(
    content: string,
    moduleName: string
  ): Map<string, string> {
    // Custom re-export processing
  }
}
```

2. **Update parsing strategy type**:

```typescript
// packages/aiken-sdk/src/registry.ts
export interface PackageConfig {
  // ... other properties
  parsingStrategy: "stdlib" | "prelude" | "vodka" | "anastasia" | "new-package";
}
```

3. **Add custom parsing configuration**:

```typescript
{
  id: "new-package",
  name: "New Package",
  parsingStrategy: "new-package",
  customParsing: {
    specialHandling: ["custom-imports", "special-types"],
    parserExtensions: ["parseNewPackageSpecific"],
    postProcessing: ["processNewPackageReExports"]
  }
}
```

### 4. Add to Registry

**File**: `packages/aiken-sdk/src/registry.ts`

```typescript
export const PACKAGE_REGISTRY: PackageConfig[] = [
  // ... existing packages
  {
    id: "new-package",
    name: "New Package",
    description: "Description of the new package",
    icon: "IconCode",
    path: "packages/aiken-new-package/lib",
    publicPath: "public/aiken-lib/aiken-new-package",
    enabled: true,
    priority: 5,
    parsingStrategy: "new-package", // New or existing strategy
    customParsing: {
      specialHandling: ["custom-imports"],
      postProcessing: ["processNewPackageReExports"],
    },
  },
];
```

### 5. Done!

- UI automatically includes the new package
- Types are automatically generated
- Copy script automatically copies the package
- API automatically includes the package
- Custom parsing logic is applied automatically

## Migration Checklist

### Phase 1: Foundation

- [ ] Create `packages/aiken-sdk/src/registry.ts`
- [ ] Update `packages/aiken-sdk/src/types.ts` to use generated types
- [ ] Test that existing functionality still works

### Phase 2: SDK Updates

- [ ] Update `packages/aiken-sdk/src/sdk.ts` to use registry
- [ ] Update `packages/aiken-sdk/src/index.ts` to export registry
- [ ] Test SDK functionality

### Phase 3: Build System

- [ ] Update `scripts/copy-aiken-files.js` to use registry
- [ ] Test build process

### Phase 4: API Updates

- [ ] Update `app/api/aiken-library/route.ts` to use registry
- [ ] Test API functionality

### Phase 5: UI Updates

- [ ] Update `app/components/search-filters.tsx`
- [ ] Update `app/components/stats-grid.tsx`
- [ ] Update `app/page.tsx`
- [ ] Test UI functionality

### Phase 6: Cleanup

- [ ] Remove hardcoded references
- [ ] Update documentation
- [ ] Test full system

## Benefits After Migration

1. **Single Source of Truth**: All package configuration in one file
2. **Zero Manual Updates**: Adding packages requires only registry entry
3. **Type Safety**: Generated types prevent mismatches
4. **Consistency**: All components automatically stay in sync
5. **Maintainability**: Much easier to understand and modify
6. **Preserved Logic**: All existing parsing and special handling preserved
7. **Extensible Parsing**: Easy to add custom parsing logic for unique packages
8. **Flexible Architecture**: Supports both standard and custom parsing strategies

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure registry is imported correctly in all files
2. **Build Errors**: Check that copy script can access registry
3. **Runtime Errors**: Verify package paths exist and are accessible
4. **UI Issues**: Ensure components are importing from correct SDK exports

### Testing

After each phase, test:

- Build process completes successfully
- Development server starts without errors
- All existing functionality works
- New packages appear in UI correctly
- Search and filtering work for all packages

## Notes

- All existing parsing logic is preserved
- Special handling (like vodka re-exports) remains intact
- Migration can be done incrementally
- Backward compatibility maintained throughout
- Registry can be extended with additional configuration options
- Each package can have unique parsing requirements
- New parsing strategies can be added without breaking existing ones
- Custom parsing logic is applied automatically based on registry configuration
