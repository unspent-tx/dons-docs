import {
  AikenImport,
  AikenFunction,
  AikenType,
  AikenConstant,
  AikenParameter,
  SourceType,
} from "./types.js";

export class AikenParser {
  /**
   * Parse imports from Aiken file content
   */
  static parseImports(
    content: string,
    source: SourceType = "stdlib"
  ): AikenImport[] {
    const imports: AikenImport[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match: use module_name
      // Match: use module_name.{item1, item2}
      // Match: use module_name as alias
      // Match: use module_name.{item1, item2} as alias
      const useMatch = line.match(
        /^use\s+([a-zA-Z_][a-zA-Z0-9_]*(?:\/[a-zA-Z_][a-zA-Z0-9_]*)*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)\s*(?:\.{([^}]+)})?\s*(?:as\s+([a-zA-Z_][a-zA-Z0-9_]*))?\s*$/
      );

      if (useMatch) {
        const [, module, itemsStr, alias] = useMatch;
        const items = itemsStr
          ? itemsStr.split(",").map((item) => item.trim())
          : [];

        imports.push({
          module,
          items,
          alias,
          line: i + 1,
          raw: line,
          source,
        });
      }
    }

    return imports;
  }

  /**
   * Parse function definitions from Aiken file content
   */
  static parseFunctions(
    content: string,
    source: SourceType = "stdlib"
  ): AikenFunction[] {
    const functions: AikenFunction[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("//") || line.startsWith("///")) {
        continue;
      }

      // Match function definitions with various patterns:
      // Single line: pub fn name(params) -> return_type {
      // Multi-line: fn name(
      const fnMatch = line.match(
        /^(pub\s+)?fn\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/
      );

      if (fnMatch) {
        const [, pubKeyword, name] = fnMatch;
        const isPublic = !!pubKeyword;

        // Collect the complete function signature (might span multiple lines)
        let signature = line;
        let paramsStr = "";
        let returnType = "";
        let currentLine = i;

        // If the line doesn't end with ) or {, it's a multi-line function
        if (
          !line.includes(")") ||
          (!line.includes("{") && !line.includes("->"))
        ) {
          // Collect all lines until we find the closing ) and opening {
          while (currentLine < lines.length) {
            const nextLine = lines[currentLine];
            signature +=
              (signature.endsWith(line) ? "" : " ") + nextLine.trim();

            if (nextLine.includes(")")) {
              break;
            }
            currentLine++;
          }

          // Continue collecting until we find the return type and opening brace
          while (
            currentLine < lines.length &&
            !lines[currentLine].includes("{")
          ) {
            currentLine++;
            if (currentLine < lines.length) {
              const nextLine = lines[currentLine].trim();
              if (nextLine && !nextLine.includes("{")) {
                signature += " " + nextLine;
              }
            }
          }
        }

        // Extract parameters from the signature
        const paramMatch = signature.match(/\(([^)]*)\)/);
        if (paramMatch) {
          paramsStr = paramMatch[1];
        }

        // Extract return type
        const returnMatch = signature.match(/\)\s*->\s*([^{]+)/);
        if (returnMatch) {
          returnType = returnMatch[1].trim();
        }

        const parameters = this.parseParameters(paramsStr || "");

        // Look for documentation comment above the function
        let documentation: string | undefined;
        let docLines: string[] = [];
        let j = i - 1;

        // Collect all documentation lines above the function
        while (j >= 0) {
          const docLine = lines[j].trim();
          if (docLine.startsWith("///")) {
            docLines.unshift(docLine.substring(3).trim());
            j--;
          } else if (docLine === "") {
            // Skip empty lines
            j--;
          } else {
            break;
          }
        }

        if (docLines.length > 0) {
          documentation = docLines.join("\n");
        }

        // NEW: Capture the full function implementation body
        let implementation: string | undefined;
        let implementationLines: string[] = [];
        let functionEndLine = i; // Start from the original function declaration line

        // Capture the complete function from declaration to closing brace
        let braceCount = 0;
        let foundOpenBrace = false;

        for (let k = functionEndLine; k < lines.length; k++) {
          const bodyLine = lines[k];
          implementationLines.push(bodyLine);

          // Count braces to determine when function ends
          for (let ch = 0; ch < bodyLine.length; ch++) {
            if (bodyLine[ch] === "{") {
              braceCount++;
              foundOpenBrace = true;
            } else if (bodyLine[ch] === "}") {
              braceCount--;
              if (foundOpenBrace && braceCount === 0) {
                // Function ends here
                functionEndLine = k;
                implementation = implementationLines.join("\n");
                break;
              }
            }
          }

          if (foundOpenBrace && braceCount === 0) {
            break;
          }
        }

        // NEW: Look for test cases related to this function
        let tests: string[] = [];
        let testStartLine = functionEndLine + 1;

        // Look for test functions after the current function
        while (testStartLine < lines.length) {
          const testLine = lines[testStartLine].trim();

          // Skip empty lines and comments
          if (
            !testLine ||
            testLine.startsWith("//") ||
            testLine.startsWith("///")
          ) {
            testStartLine++;
            continue;
          }

          // Check if this is a test function related to our function
          const testMatch = testLine.match(
            /^test\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/
          );
          if (testMatch) {
            const testName = testMatch[1];

            // Check if test name contains the function name (common pattern)
            if (
              testName.includes(name) ||
              testName.toLowerCase().includes(name.toLowerCase())
            ) {
              // Capture the full test case
              let testLines: string[] = [];
              let testBraceCount = 0;
              let foundTestOpenBrace = false;

              for (let k = testStartLine; k < lines.length; k++) {
                const testBodyLine = lines[k];
                testLines.push(testBodyLine);

                // Count braces to determine when test ends
                for (let ch = 0; ch < testBodyLine.length; ch++) {
                  if (testBodyLine[ch] === "{") {
                    testBraceCount++;
                    foundTestOpenBrace = true;
                  } else if (testBodyLine[ch] === "}") {
                    testBraceCount--;
                    if (foundTestOpenBrace && testBraceCount === 0) {
                      // Test ends here
                      tests.push(testLines.join("\n"));
                      testStartLine = k + 1;
                      break;
                    }
                  }
                }

                if (foundTestOpenBrace && testBraceCount === 0) {
                  break;
                }
              }

              if (foundTestOpenBrace && testBraceCount === 0) {
                continue; // Continue looking for more tests
              }
            }
          }

          // If we hit another function or significant structure, stop looking for tests
          if (testLine.match(/^(pub\s+)?fn\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/)) {
            break;
          }

          testStartLine++;
        }

        functions.push({
          name,
          signature: signature.trim(),
          documentation,
          parameters,
          returnType: returnType || "Unknown",
          line: i + 1,
          raw: signature.trim(),
          isPublic,
          source,
          implementation,
          tests: tests.length > 0 ? tests : undefined,
        });
      }
    }

    return functions;
  }

  /**
   * Parse type definitions from Aiken file content
   */
  static parseTypes(
    content: string,
    source: SourceType = "stdlib"
  ): AikenType[] {
    const types: AikenType[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("//") || line.startsWith("///")) {
        continue;
      }

      // Match type definitions with various patterns:
      // Pattern 1: type TypeName = definition
      // Pattern 2: type TypeName { ... } (enum types)
      // Pattern 3: opaque type TypeName { ... } (opaque types)
      const typeMatch = line.match(
        /^(pub\s+)?(opaque\s+)?type\s+([a-zA-Z_][a-zA-Z0-9_]*(?:<[^>]*>)?)\s*([={].*)?$/
      );

      if (typeMatch) {
        const [, pubKeyword, opaqueKeyword, name, definitionStart] = typeMatch;
        const isPublic = !!pubKeyword;
        const isOpaque = !!opaqueKeyword;

        let fullDefinition = "";

        if (definitionStart) {
          if (definitionStart.startsWith("=")) {
            // Type alias format: type Name = definition
            fullDefinition = definitionStart.substring(1).trim();
            let nextLineIndex = i + 1;

            // If the definition is empty or seems incomplete, look for the next lines
            if (!fullDefinition || fullDefinition === "") {
              // Find the actual definition on the next lines
              while (nextLineIndex < lines.length) {
                const nextLine = lines[nextLineIndex].trim();
                if (!nextLine) {
                  nextLineIndex++;
                  continue;
                }

                // This is likely the actual type definition
                if (!nextLine.startsWith("//") && !nextLine.startsWith("///")) {
                  fullDefinition = nextLine;
                  break;
                }
                nextLineIndex++;
              }
            }

            // Continue collecting additional lines if the definition seems incomplete
            nextLineIndex++;
            while (nextLineIndex < lines.length) {
              const nextLine = lines[nextLineIndex].trim();
              if (!nextLine) {
                nextLineIndex++;
                continue;
              }

              // Check if this line is part of the type definition
              if (
                nextLine.startsWith("|") ||
                nextLine.startsWith(" ") ||
                (fullDefinition.includes("{") &&
                  !fullDefinition.includes("}")) ||
                (fullDefinition.includes("(") && !fullDefinition.includes(")"))
              ) {
                fullDefinition += " " + nextLine;
                nextLineIndex++;
              } else {
                break;
              }
            }
          } else if (definitionStart.startsWith("{")) {
            // Enum or opaque type format: type Name { ... }
            fullDefinition = definitionStart;
            let nextLineIndex = i + 1;
            let braceCount =
              (definitionStart.match(/\{/g) || []).length -
              (definitionStart.match(/\}/g) || []).length;

            // Continue collecting lines until we find the closing brace
            while (nextLineIndex < lines.length && braceCount > 0) {
              const nextLine = lines[nextLineIndex].trim();
              if (nextLine) {
                fullDefinition += " " + nextLine;
                braceCount +=
                  (nextLine.match(/\{/g) || []).length -
                  (nextLine.match(/\}/g) || []).length;
              }
              nextLineIndex++;
            }
          }
        } else {
          // Multi-line type definition - the definition starts on the next line
          let nextLineIndex = i + 1;

          // Find the definition start
          while (nextLineIndex < lines.length) {
            const nextLine = lines[nextLineIndex].trim();
            if (!nextLine) {
              nextLineIndex++;
              continue;
            }

            if (!nextLine.startsWith("//") && !nextLine.startsWith("///")) {
              if (nextLine.startsWith("{")) {
                // Enum type format
                fullDefinition = nextLine;
                let braceCount =
                  (nextLine.match(/\{/g) || []).length -
                  (nextLine.match(/\}/g) || []).length;
                nextLineIndex++;

                // Continue collecting lines until we find the closing brace
                while (nextLineIndex < lines.length && braceCount > 0) {
                  const nextLine2 = lines[nextLineIndex].trim();
                  if (nextLine2) {
                    fullDefinition += " " + nextLine2;
                    braceCount +=
                      (nextLine2.match(/\{/g) || []).length -
                      (nextLine2.match(/\}/g) || []).length;
                  }
                  nextLineIndex++;
                }
              } else {
                // Type alias format
                fullDefinition = nextLine;
              }
              break;
            }
            nextLineIndex++;
          }
        }

        if (fullDefinition) {
          // Clean up the definition - remove extra spaces and normalize
          fullDefinition = fullDefinition.replace(/\s+/g, " ").trim();

          // For opaque types, prepend the opaque keyword to the definition
          if (isOpaque && !fullDefinition.startsWith("opaque")) {
            fullDefinition = `opaque ${fullDefinition}`;
          }

          types.push({
            name,
            definition: fullDefinition,
            line: i + 1,
            raw: line,
            isPublic,
            source,
          });
        }
      }
    }

    return types;
  }

  /**
   * Parse constants from Aiken file content - includes special handling for vodka re-exports
   */
  static parseConstants(
    content: string,
    source: SourceType = "stdlib"
  ): AikenConstant[] {
    const constants: AikenConstant[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("//") || line.startsWith("///")) {
        continue;
      }

      // Match constants with various patterns:
      // const name: type = value
      // pub const name: type = value
      // const name = value (inferred type)
      // For vodka: pub const name = module.function (re-export)
      const constMatch = line.match(
        /^(pub\s+)?const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*([^=]+?))?\s*=\s*(.+)/
      );

      if (constMatch) {
        const [, pubKeyword, name, type, value] = constMatch;
        const isPublic = !!pubKeyword;

        // Collect multi-line constant definitions
        let fullValue = value.trim();
        let nextLineIndex = i + 1;

        // If the value seems incomplete (contains unclosed braces/brackets), try to capture more lines
        while (nextLineIndex < lines.length) {
          const nextLine = lines[nextLineIndex].trim();
          if (!nextLine) {
            nextLineIndex++;
            continue;
          }

          // Check if this line is part of the constant definition
          const openBraces = (fullValue.match(/\{/g) || []).length;
          const closeBraces = (fullValue.match(/\}/g) || []).length;
          const openBrackets = (fullValue.match(/\[/g) || []).length;
          const closeBrackets = (fullValue.match(/\]/g) || []).length;
          const openParens = (fullValue.match(/\(/g) || []).length;
          const closeParens = (fullValue.match(/\)/g) || []).length;

          if (
            openBraces > closeBraces ||
            openBrackets > closeBrackets ||
            openParens > closeParens
          ) {
            fullValue += " " + nextLine;
            nextLineIndex++;
          } else {
            break;
          }
        }

        // For vodka library: detect re-export patterns
        let reExportedAs: string[] | undefined;
        if (source === "vodka" && isPublic && fullValue.includes(".")) {
          // This is likely a re-export: pub const name = module.function
          const reExportMatch = fullValue.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\./);
          if (reExportMatch) {
            reExportedAs = [name]; // This constant is re-exporting another function
          }
        }

        constants.push({
          name,
          type: type?.trim() || "Unknown",
          value: fullValue,
          line: i + 1,
          raw: line,
          isPublic,
          source,
          reExportedAs,
        });
      }
    }

    return constants;
  }

  /**
   * Parse function parameters
   */
  private static parseParameters(paramsStr: string): AikenParameter[] {
    if (!paramsStr.trim()) return [];

    const parameters: AikenParameter[] = [];

    // Handle multi-line parameters by first flattening them
    const flatParams = paramsStr.replace(/\s+/g, " ").trim();

    // Split by comma, but be careful about nested commas in function types
    const paramParts = this.splitParameters(flatParams);

    for (const part of paramParts) {
      const param = part.trim();
      if (!param) continue;

      // Match: param_name: Type
      // Match: param_name: Option(Type) (for optional parameters)
      // Match: param_name (without explicit type)
      const paramMatch = param.match(
        /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*(.+))?$/
      );

      if (paramMatch) {
        const [, name, type] = paramMatch;
        const paramType = type?.trim() || "Unknown";
        const isOptional = paramType.includes("Option(");

        parameters.push({
          name,
          type: paramType,
          optional: isOptional,
        });
      }
    }

    return parameters;
  }

  /**
   * Split parameters by comma while respecting nested parentheses and brackets
   */
  private static splitParameters(params: string): string[] {
    const result: string[] = [];
    let current = "";
    let depth = 0;
    let inAngleBrackets = 0;

    for (let i = 0; i < params.length; i++) {
      const char = params[i];

      if (char === "(" || char === "[" || char === "{") {
        depth++;
      } else if (char === ")" || char === "]" || char === "}") {
        depth--;
      } else if (char === "<") {
        inAngleBrackets++;
      } else if (char === ">") {
        inAngleBrackets--;
      } else if (char === "," && depth === 0 && inAngleBrackets === 0) {
        result.push(current.trim());
        current = "";
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      result.push(current.trim());
    }

    return result;
  }

  /**
   * Check if a module is a re-export file for vodka library
   */
  static isVodkaReExportFile(moduleName: string, source: SourceType): boolean {
    if (source !== "vodka") return false;

    // Main re-export files in vodka are cocktail.ak and mocktail.ak
    return moduleName === "cocktail" || moduleName === "mocktail";
  }

  /**
   * Extract re-export relationships from vodka files
   */
  static parseVodkaReExports(
    content: string,
    moduleName: string
  ): Map<string, string> {
    const reExports = new Map<string, string>();

    if (moduleName !== "cocktail" && moduleName !== "mocktail") {
      return reExports;
    }

    const lines = content.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Match: pub const name = module.function
      const reExportMatch = trimmed.match(
        /^pub\s+const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)/
      );

      if (reExportMatch) {
        const [, exportedName, originalFunction] = reExportMatch;
        reExports.set(originalFunction, exportedName);
      }
    }

    return reExports;
  }

  /**
   * Extract module dependencies from imports
   */
  static extractDependencies(imports: AikenImport[]): string[] {
    return imports.map((imp) => imp.module);
  }
}
