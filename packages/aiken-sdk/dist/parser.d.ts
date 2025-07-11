import { AikenImport, AikenFunction, AikenType, AikenConstant } from "./types.js";
export declare class AikenParser {
    /**
     * Parse imports from Aiken file content
     */
    static parseImports(content: string, source?: "stdlib" | "prelude" | "vodka"): AikenImport[];
    /**
     * Parse function definitions from Aiken file content
     */
    static parseFunctions(content: string, source?: "stdlib" | "prelude" | "vodka"): AikenFunction[];
    /**
     * Parse type definitions from Aiken file content
     */
    static parseTypes(content: string, source?: "stdlib" | "prelude" | "vodka"): AikenType[];
    /**
     * Parse constants from Aiken file content - includes special handling for vodka re-exports
     */
    static parseConstants(content: string, source?: "stdlib" | "prelude" | "vodka"): AikenConstant[];
    /**
     * Parse function parameters
     */
    private static parseParameters;
    /**
     * Split parameters by comma while respecting nested parentheses and brackets
     */
    private static splitParameters;
    /**
     * Check if a module is a re-export file for vodka library
     */
    static isVodkaReExportFile(moduleName: string, source: "stdlib" | "prelude" | "vodka"): boolean;
    /**
     * Extract re-export relationships from vodka files
     */
    static parseVodkaReExports(content: string, moduleName: string): Map<string, string>;
    /**
     * Extract module dependencies from imports
     */
    static extractDependencies(imports: AikenImport[]): string[];
}
//# sourceMappingURL=parser.d.ts.map