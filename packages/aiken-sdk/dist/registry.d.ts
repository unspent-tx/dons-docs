export interface PackageConfig {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    path: string;
    publicPath: string;
    enabled: boolean;
    priority: number;
    parsingStrategy: "stdlib" | "prelude" | "vodka" | "anastasia";
    customParsing?: {
        specialHandling?: string[];
        parserExtensions?: string[];
        postProcessing?: string[];
    };
}
export declare const PACKAGE_REGISTRY: PackageConfig[];
export declare function getEnabledPackages(): PackageConfig[];
export declare function getPackageById(id: string): PackageConfig | undefined;
export declare function getSortedPackages(): PackageConfig[];
//# sourceMappingURL=registry.d.ts.map