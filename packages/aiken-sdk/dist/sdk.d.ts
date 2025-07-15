import { AikenModule, ParseOptions } from "./types.js";
export declare class AikenSDK {
    private library;
    private stdlibPath;
    private preludePath;
    private vodkaPath;
    private anastasiaPath;
    constructor(stdlibPath?: string, preludePath?: string, vodkaPath?: string, anastasiaPath?: string);
    /**
     * Load and analyze Aiken libraries from multiple sources
     */
    loadLibrary(options?: ParseOptions): Promise<void>;
    /**
     * Clear all library data
     */
    private clearLibrary;
    /**
     * Load and analyze a specific source library
     */
    private loadSourceLibrary;
    /**
     * Process vodka re-export relationships
     */
    private processVodkaReExports;
    /**
     * Update vodka functions with re-export information
     */
    private updateVodkaReExports;
    /**
     * Recursively find all .ak files in the given directory
     */
    private findAikenFiles;
    /**
     * Parse a single Aiken file
     */
    private parseFile;
    /**
     * Convert file path to module name
     */
    private getModuleName;
    /**
     * Get all modules
     */
    getModules(): Map<string, AikenModule>;
    /**
     * Get modules by source
     */
    getModulesBySource(source: "stdlib" | "prelude" | "vodka" | "anastasia"): Map<string, AikenModule>;
    /**
     * Get a specific module by name
     */
    getModule(name: string): AikenModule | undefined;
    /**
     * Get all public functions from all modules
     */
    getAllFunctions(): Map<string, any>;
    /**
     * Get all private functions (atoms) from all modules
     */
    getAllAtoms(): Map<string, any>;
    /**
     * Get functions by source
     */
    getFunctionsBySource(source: "stdlib" | "prelude" | "vodka" | "anastasia"): Map<string, any>;
    /**
     * Get atoms by source
     */
    getAtomsBySource(source: "stdlib" | "prelude" | "vodka" | "anastasia"): Map<string, any>;
    /**
     * Get public functions by module name
     */
    getFunctionsByModule(moduleName: string): any[];
    /**
     * Get private functions (atoms) by module name
     */
    getAtomsByModule(moduleName: string): any[];
    /**
     * Search for public functions by name pattern
     */
    searchFunctions(pattern: string): any[];
    /**
     * Search for private functions (atoms) by name pattern
     */
    searchAtoms(pattern: string): any[];
    /**
     * Get all public types from all modules
     */
    getAllTypes(): Map<string, any>;
    /**
     * Get all private types from all modules
     */
    getAllPrivateTypes(): Map<string, any>;
    /**
     * Get types by source
     */
    getTypesBySource(source: "stdlib" | "prelude" | "vodka" | "anastasia"): Map<string, any>;
    /**
     * Get all public constants from all modules
     */
    getAllConstants(): Map<string, any>;
    /**
     * Get all private constants from all modules
     */
    getAllPrivateConstants(): Map<string, any>;
    /**
     * Get constants by source
     */
    getConstantsBySource(source: "stdlib" | "prelude" | "vodka" | "anastasia"): Map<string, any>;
    /**
     * Get dependency tree for a module
     */
    getDependencyTree(moduleName: string): string[];
    /**
     * Get modules that depend on a specific module
     */
    getReverseDependencies(moduleName: string): string[];
    /**
     * Get library statistics
     */
    getStats(): {
        totalModules: number;
        totalFunctions: number;
        totalAtoms: number;
        totalTypes: number;
        totalPrivateTypes: number;
        totalConstants: number;
        totalPrivateConstants: number;
        totalDependencies: number;
        sourceStats: {
            stdlib: {
                modules: number;
                functions: number;
                atoms: number;
                types: number;
                privateTypes: number;
                constants: number;
                privateConstants: number;
            };
            prelude: {
                modules: number;
                functions: number;
                atoms: number;
                types: number;
                privateTypes: number;
                constants: number;
                privateConstants: number;
            };
            vodka: {
                modules: number;
                functions: number;
                atoms: number;
                types: number;
                privateTypes: number;
                constants: number;
                privateConstants: number;
            };
            anastasia: {
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
    /**
     * Export the entire library as JSON
     */
    exportLibrary(): any;
}
//# sourceMappingURL=sdk.d.ts.map