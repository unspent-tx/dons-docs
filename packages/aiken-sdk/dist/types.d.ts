export interface AikenImport {
    module: string;
    items: string[];
    alias?: string;
    line: number;
    raw: string;
    source: "stdlib" | "prelude" | "vodka" | "anastasia";
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
    source: "stdlib" | "prelude" | "vodka" | "anastasia";
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
    source: "stdlib" | "prelude" | "vodka" | "anastasia";
    reExportedAs?: string[];
}
export interface AikenConstant {
    name: string;
    type: string;
    value: string;
    line: number;
    raw: string;
    isPublic: boolean;
    source: "stdlib" | "prelude" | "vodka" | "anastasia";
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
    source: "stdlib" | "prelude" | "vodka" | "anastasia";
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
}
export interface ParseOptions {
    includeTests?: boolean;
    includeComments?: boolean;
    followDependencies?: boolean;
    includePrivate?: boolean;
    sources?: Array<"stdlib" | "prelude" | "vodka" | "anastasia">;
}
//# sourceMappingURL=types.d.ts.map