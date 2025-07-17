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
  SourceType,
} from "./types.js";

// Export registry
export {
  PACKAGE_REGISTRY,
  getEnabledPackages,
  getPackageById,
  getSortedPackages,
} from "./registry.js";
export type { PackageConfig } from "./registry.js";

// Updated factory function
export function createAikenSDK(packageConfigs?: any[]) {
  return new AikenSDK(packageConfigs);
}
