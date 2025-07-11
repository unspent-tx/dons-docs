// Import for internal use
import { AikenSDK } from "./sdk.js";
// Export main SDK class
export { AikenSDK } from "./sdk.js";
// Export parser utilities
export { AikenParser } from "./parser.js";
// Export a default instance creator
export function createAikenSDK(stdlibPath, preludePath, vodkaPath) {
    return new AikenSDK(stdlibPath, preludePath, vodkaPath);
}
//# sourceMappingURL=index.js.map