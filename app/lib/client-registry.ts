// Client-side registry - only contains UI-related information
// No server-side dependencies like fs, path, etc.

export interface ClientPackageConfig {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  priority: number;
}

export const CLIENT_PACKAGE_REGISTRY: ClientPackageConfig[] = [
  {
    id: "stdlib",
    name: "Standard Library",
    description: "Core Aiken standard library",
    icon: "IconBook",
    priority: 1,
  },
  {
    id: "prelude",
    name: "Prelude",
    description: "Aiken prelude library",
    icon: "IconCode",
    priority: 2,
  },
  {
    id: "vodka",
    name: "Vodka",
    description: "Vodka library with re-exports",
    icon: "IconBrandTabler",
    priority: 3,
  },
  {
    id: "anastasia",
    name: "Anastasia Patterns",
    description: "Anastasia Labs design patterns",
    icon: "IconCode",
    priority: 4,
  },
];

// Generate source type from registry
export type SourceType = (typeof CLIENT_PACKAGE_REGISTRY)[number]["id"];

// Helper functions
export function getSortedPackages(): ClientPackageConfig[] {
  return CLIENT_PACKAGE_REGISTRY.sort((a, b) => a.priority - b.priority);
}

export function getPackageById(id: string): ClientPackageConfig | undefined {
  return CLIENT_PACKAGE_REGISTRY.find((pkg) => pkg.id === id);
}
