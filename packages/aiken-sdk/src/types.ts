export interface AikenImport {
  module: string;
  items: string[];
  alias?: string;
  line: number;
  raw: string;
  source: "stdlib" | "prelude" | "vodka";
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
  source: "stdlib" | "prelude" | "vodka";
  // For vodka library: track re-exported names
  reExportedAs?: string[];
  // Full function implementation body
  implementation?: string;
  // Associated test cases
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
  source: "stdlib" | "prelude" | "vodka";
  // For vodka library: track re-exported names
  reExportedAs?: string[];
}

export interface AikenConstant {
  name: string;
  type: string;
  value: string;
  line: number;
  raw: string;
  isPublic: boolean;
  source: "stdlib" | "prelude" | "vodka";
  // For vodka library: track re-exported names
  reExportedAs?: string[];
}

export interface AikenModule {
  path: string;
  name: string;
  imports: AikenImport[];
  // Public API - importable by other modules
  functions: AikenFunction[];
  types: AikenType[];
  constants: AikenConstant[];
  // Private implementation - internal building blocks
  atoms: AikenFunction[]; // Private functions that build the public API
  privateTypes: AikenType[];
  privateConstants: AikenConstant[];
  content: string;
  dependencies: string[];
  source: "stdlib" | "prelude" | "vodka";
  // For vodka library: track if this is a re-export file
  isReExportFile?: boolean;
}

export interface AikenLibrary {
  modules: Map<string, AikenModule>;
  dependencies: Map<string, string[]>;
  // Public API functions across all modules
  functions: Map<string, AikenFunction>;
  types: Map<string, AikenType>;
  constants: Map<string, AikenConstant>;
  // Private implementation functions across all modules
  atoms: Map<string, AikenFunction>;
  privateTypes: Map<string, AikenType>;
  privateConstants: Map<string, AikenConstant>;
  // Source statistics
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
  };
}

export interface ParseOptions {
  includeTests?: boolean;
  includeComments?: boolean;
  followDependencies?: boolean;
  includePrivate?: boolean; // Whether to include private functions/types/constants
  sources?: Array<"stdlib" | "prelude" | "vodka">; // Which sources to analyze
}
