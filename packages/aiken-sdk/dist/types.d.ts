import { PACKAGE_REGISTRY } from "./registry.js";
export type SourceType = (typeof PACKAGE_REGISTRY)[number]["id"];
export interface AikenImport {
    module: string;
    items: string[];
    alias?: string;
    line: number;
    raw: string;
    source: SourceType;
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
    source: SourceType;
    reExportedAs?: string[];
    implementation?: string;
    tests?: string[];
}
export interface AikenParameter {
    name: string;
    type: string;
    optional?: boolean;
}
export interface AikenType {
    name: string;
    definition: string;
    line: number;
    raw: string;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
}
export interface AikenConstant {
    name: string;
    type: string;
    value: string;
    line: number;
    raw: string;
    isPublic: boolean;
    source: SourceType;
    reExportedAs?: string[];
}
export interface AikenModule {
    path: string;
    name: string;
    imports: AikenImport[];
    functions: AikenFunction[];
    types: AikenType[];
    constants: AikenConstant[];
    atoms: AikenFunction[];
    privateTypes: AikenType[];
    privateConstants: AikenConstant[];
    content: string;
    dependencies: string[];
    source: SourceType;
    isReExportFile?: boolean;
}
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
    sources?: SourceType[];
}
//# sourceMappingURL=types.d.ts.map