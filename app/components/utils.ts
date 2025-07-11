// Utility function to convert full name to import syntax
export const getImportStatement = (
  fullName: string,
  functionName: string,
  reExportedAs?: string[]
) => {
  // If this function is re-exported (like in Vodka's cocktail/mocktail), use the re-export path
  if (reExportedAs && reExportedAs.length > 0) {
    // For Vodka re-exports, use the simplified path like "use cocktail.{compare_address}"
    const parts = fullName.split(":");
    if (parts.length === 2) {
      const [source, modulePath] = parts;
      if (source === "vodka") {
        // Check if this is a cocktail or mocktail re-export
        if (
          modulePath.includes("cocktail") ||
          modulePath.includes("mocktail")
        ) {
          const reExportModule = modulePath.includes("cocktail")
            ? "cocktail"
            : "mocktail";
          return `use ${reExportModule}.{${functionName}}`;
        }
      }
    }
  }

  // Convert from "stdlib:aiken.collection.pairs.insert_with_by_ascending_key"
  // to "use aiken/collection/pairs.{insert_with_by_ascending_key}"
  const parts = fullName.split(":");
  if (parts.length === 2) {
    const [source, modulePath] = parts;
    const modulePathParts = modulePath.split(".");
    // Remove the function name from the end
    const pathWithoutFunction = modulePathParts.slice(0, -1).join("/");
    return `use ${pathWithoutFunction}.{${functionName}}`;
  }
  return `use ${fullName}.{${functionName}}`;
};
