import { AikenFunction, AikenType, AikenConstant, SourceType } from "./types.js";
export interface TypeScriptExport {
    name: string;
    type: "function" | "class" | "interface" | "type" | "const" | "enum" | "namespace";
    isDefault: boolean;
    line: number;
    raw: string;
    source: SourceType;
}
export interface TypeScriptClass {
    name: string;
    methods: TypeScriptMethod[];
    properties: TypeScriptProperty[];
    extends?: string;
    implements?: string[];
    line: number;
    raw: string;
    source: SourceType;
}
export interface TypeScriptMethod {
    name: string;
    parameters: TypeScriptParameter[];
    returnType?: string;
    isPublic: boolean;
    isStatic: boolean;
    line: number;
    raw: string;
}
export interface TypeScriptProperty {
    name: string;
    type?: string;
    isPublic: boolean;
    isStatic: boolean;
    isReadonly: boolean;
    line: number;
    raw: string;
}
export interface TypeScriptParameter {
    name: string;
    type?: string;
    isOptional: boolean;
    defaultValue?: string;
}
export declare class OffchainParser {
    /**
     * Parse TypeScript exports from file content
     */
    static parseExports(content: string, source?: SourceType): TypeScriptExport[];
    /**
     * Parse TypeScript functions from file content
     */
    static parseFunctions(content: string, source?: SourceType): AikenFunction[];
    /**
     * Parse TypeScript classes from file content
     */
    static parseClasses(content: string, source?: SourceType): TypeScriptClass[];
    /**
     * Parse TypeScript types and interfaces from file content
     */
    static parseTypes(content: string, source?: SourceType): AikenType[];
    /**
     * Parse TypeScript constants from file content
     */
    static parseConstants(content: string, source?: SourceType): AikenConstant[];
    /**
     * Extract complete function block including comments and implementation
     */
    private static extractFunctionBlock;
    /**
     * Parse TypeScript parameters
     */
    private static parseTypeScriptParameters;
    /**
     * Split TypeScript parameters string into individual parameters
     */
    private static splitTypeScriptParameters;
    /**
     * Parse class methods from class body
     */
    private static parseClassMethods;
    /**
     * Parse class properties from class body
     */
    private static parseClassProperties;
}
//# sourceMappingURL=offchain-parser.d.ts.map