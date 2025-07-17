export interface PackageConfig {
  id: string; // Unique identifier (e.g., "stdlib", "anastasia")
  name: string; // Display name ("Standard Library", "Design Patterns")
  description?: string; // Optional description
  icon?: string; // Icon identifier for UI
  path: string; // Relative path to package source
  publicPath: string; // Path in public directory
  enabled: boolean; // Whether to include in builds
  priority: number; // Order in UI (lower = higher priority)
  parsingStrategy: "stdlib" | "prelude" | "vodka" | "anastasia"; // Existing parsing logic to use (keeping this for backward compatibility)
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
    name: "Anastasia Patterns",
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
