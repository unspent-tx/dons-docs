// Import for internal use
import { AikenSDK } from "./sdk.js";

// Export main SDK class
export { AikenSDK } from "./sdk.js";

// Export parser utilities
export { AikenParser } from "./parser.js";

// Export all types
export type {
  AikenImport,
  AikenFunction,
  AikenParameter,
  AikenType,
  AikenConstant,
  AikenModule,
  AikenLibrary,
  ParseOptions,
} from "./types.js";

// Export a default instance creator
export function createAikenSDK(
  stdlibPath?: string,
  preludePath?: string,
  vodkaPath?: string
) {
  return new AikenSDK(stdlibPath, preludePath, vodkaPath);
}
