export const PACKAGE_REGISTRY = [
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
export function getEnabledPackages() {
    return PACKAGE_REGISTRY.filter((pkg) => pkg.enabled);
}
export function getPackageById(id) {
    return PACKAGE_REGISTRY.find((pkg) => pkg.id === id);
}
export function getSortedPackages() {
    return getEnabledPackages().sort((a, b) => a.priority - b.priority);
}
//# sourceMappingURL=registry.js.map