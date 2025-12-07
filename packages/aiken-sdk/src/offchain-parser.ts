import {
  AikenFunction,
  AikenType,
  AikenConstant,
  AikenParameter,
  SourceType,
} from "./types.js";

export interface TypeScriptExport {
  name: string;
  type:
    | "function"
    | "class"
    | "interface"
    | "type"
    | "const"
    | "enum"
    | "namespace";
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

export class OffchainParser {
  /**
   * Parse TypeScript exports from file content
   */
  static parseExports(
    content: string,
    source: SourceType = "offchain"
  ): TypeScriptExport[] {
    const exports: TypeScriptExport[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("//") || line.startsWith("/*")) {
        continue;
      }

      // Match export statements
      // export function name
      // export const name
      // export class name
      // export interface name
      // export type name
      // export enum name
      // export default
      // export { name1, name2 }
      // export * from './module'

      // Named exports
      const namedExportMatch = line.match(
        /^export\s+(function|const|class|interface|type|enum|namespace)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(?/
      );

      if (namedExportMatch) {
        const [, type, name] = namedExportMatch;
        exports.push({
          name,
          type: type as any,
          isDefault: false,
          line: i + 1,
          raw: line,
          source,
        });
        continue;
      }

      // Default exports
      const defaultExportMatch = line.match(
        /^export\s+default\s+(function|const|class|interface|type|enum)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(?/
      );

      if (defaultExportMatch) {
        const [, type, name] = defaultExportMatch;
        exports.push({
          name,
          type: type as any,
          isDefault: true,
          line: i + 1,
          raw: line,
          source,
        });
        continue;
      }

      // Export lists: export { name1, name2 }
      const exportListMatch = line.match(/^export\s*\{([^}]+)\}/);
      if (exportListMatch) {
        const items = exportListMatch[1]
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        items.forEach((item) => {
          const nameMatch = item.match(
            /([a-zA-Z_][a-zA-Z0-9_]*)(?:\s+as\s+([a-zA-Z_][a-zA-Z0-9_]*))?/
          );
          if (nameMatch) {
            const [, name, alias] = nameMatch;
            exports.push({
              name: alias || name,
              type: "const", // Default type for export list items
              isDefault: false,
              line: i + 1,
              raw: line,
              source,
            });
          }
        });
      }
    }

    return exports;
  }

  /**
   * Parse TypeScript functions from file content
   */
  static parseFunctions(
    content: string,
    source: SourceType = "offchain"
  ): AikenFunction[] {
    const functions: AikenFunction[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines
      if (!line) {
        continue;
      }

      // Match function definitions
      // function name(params): returnType
      // const name = (params): returnType
      // export function name(params): returnType
      // public name(params): returnType
      // name(params): returnType { (class methods)
      // name = (params) => (arrow functions)
      const functionMatch = line.match(
        /^(?:\s*)(?:export\s+)?(?:public\s+)?(?:function\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(|const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\(|([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*\([^)]*\)\s*=>|([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*:\s*[^{]*\{|([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*[:=])/
      );

      if (functionMatch) {
        const [, fnName, constName, arrowName, classMethodName, methodName] =
          functionMatch;
        const name =
          fnName || constName || arrowName || classMethodName || methodName;

        if (name) {
          // Find the complete function block including comments and implementation
          const functionBlock = this.extractFunctionBlock(lines, i);

          // Extract parameters from the signature line
          const paramsMatch = line.match(/\(([^)]*)\)/);
          const parameters = paramsMatch
            ? this.parseTypeScriptParameters(paramsMatch[1])
            : [];

          // Extract return type
          const returnTypeMatch = line.match(/\)\s*:\s*([^{=]+)/);
          const returnType = returnTypeMatch
            ? returnTypeMatch[1].trim()
            : undefined;

          functions.push({
            name,
            signature: line.trim(),
            documentation: functionBlock.documentation,
            parameters: parameters.map((param) => ({
              name: param.name,
              type: param.type || "any",
              optional: param.isOptional,
            })),
            returnType: returnType || "any",
            isPublic: true, // TypeScript functions are generally public
            line: i + 1,
            raw: functionBlock.fullBlock,
            source,
            implementation: functionBlock.implementation,
          });
        }
      }
    }

    return functions;
  }

  /**
   * Parse TypeScript classes from file content
   */
  static parseClasses(
    content: string,
    source: SourceType = "offchain"
  ): TypeScriptClass[] {
    const classes: TypeScriptClass[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("//") || line.startsWith("/*")) {
        continue;
      }

      // Match class definitions
      // class name
      // class name extends parent
      // class name implements interface
      // export class name
      const classMatch = line.match(
        /^(?:export\s+)?class\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:extends\s+([a-zA-Z_][a-zA-Z0-9_]*))?\s*(?:implements\s+([^{]+))?\s*\{?/
      );

      if (classMatch) {
        const [, name, extendsClass, implementsInterfaces] = classMatch;

        // Find the class body
        let classBody = "";
        let braceCount = 0;
        let inClass = false;
        let currentLine = i;

        while (currentLine < lines.length) {
          const currentLineContent = lines[currentLine];

          if (currentLineContent.includes("{")) {
            braceCount += (currentLineContent.match(/\{/g) || []).length;
            inClass = true;
          }

          if (currentLineContent.includes("}")) {
            braceCount -= (currentLineContent.match(/\}/g) || []).length;
          }

          if (inClass) {
            classBody += currentLineContent + "\n";
          }

          if (braceCount === 0 && inClass) {
            break;
          }

          currentLine++;
        }

        // Parse methods and properties from class body
        const methods = this.parseClassMethods(classBody, i + 1);
        const properties = this.parseClassProperties(classBody, i + 1);

        classes.push({
          name,
          methods,
          properties,
          extends: extendsClass,
          implements: implementsInterfaces
            ? implementsInterfaces.split(",").map((i) => i.trim())
            : undefined,
          line: i + 1,
          raw: line,
          source,
        });
      }
    }

    return classes;
  }

  /**
   * Parse TypeScript types and interfaces from file content
   */
  static parseTypes(
    content: string,
    source: SourceType = "offchain"
  ): AikenType[] {
    const types: AikenType[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("//") || line.startsWith("/*")) {
        continue;
      }

      // Match type and interface definitions
      // type name = ...
      // interface name { ... }
      // export type name = ...
      // export interface name { ... }
      const typeMatch = line.match(
        /^(?:export\s+)?(type|interface)\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:extends\s+([^{]+))?\s*[={\s]/
      );

      if (typeMatch) {
        const [, typeKind, name, extendsType] = typeMatch;

        // Find the type definition body
        let typeBody = "";
        let braceCount = 0;
        let inType = false;
        let currentLine = i;

        while (currentLine < lines.length) {
          const currentLineContent = lines[currentLine];

          if (
            currentLineContent.includes("{") ||
            currentLineContent.includes("=")
          ) {
            braceCount += (currentLineContent.match(/[\{=]/g) || []).length;
            inType = true;
          }

          if (
            currentLineContent.includes("}") ||
            currentLineContent.includes(";")
          ) {
            braceCount -= (currentLineContent.match(/[\};]/g) || []).length;
          }

          if (inType) {
            typeBody += currentLineContent + "\n";
          }

          if (braceCount === 0 && inType) {
            break;
          }

          currentLine++;
        }

        types.push({
          name,
          definition: typeBody.trim(),
          isPublic: true,
          line: i + 1,
          raw: line,
          source,
        });
      }
    }

    return types;
  }

  /**
   * Parse TypeScript constants from file content
   */
  static parseConstants(
    content: string,
    source: SourceType = "offchain"
  ): AikenConstant[] {
    const constants: AikenConstant[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith("//") || line.startsWith("/*")) {
        continue;
      }

      // Match constant definitions
      // const name = value
      // export const name = value
      // const name: type = value
      const constMatch = line.match(
        /^(?:export\s+)?const\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*(?::\s*([^=]+))?\s*=\s*(.+)$/
      );

      if (constMatch) {
        const [, name, type, value] = constMatch;

        constants.push({
          name,
          type: type ? type.trim() : "any",
          value: value.trim(),
          isPublic: true,
          line: i + 1,
          raw: line,
          source,
        });
      }
    }

    return constants;
  }

  /**
   * Extract complete function block including comments and implementation
   */
  private static extractFunctionBlock(
    lines: string[],
    startLine: number
  ): { documentation: string; implementation: string; fullBlock: string } {
    let documentation = "";
    let implementation = "";
    let fullBlock = "";

    // Look backwards for JSDoc comments
    let commentStart = startLine;
    let commentEnd = startLine;
    let foundJSDoc = false;

    // Check if the line immediately above is the end of a JSDoc comment
    if (
      lines[commentStart - 1] &&
      lines[commentStart - 1].trim().startsWith("*/")
    ) {
      commentEnd = commentStart - 1;
      // Go up until we find the start of the JSDoc
      for (let i = commentEnd - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith("/**")) {
          commentStart = i;
          foundJSDoc = true;
          break;
        }
      }
    }

    // Extract documentation
    if (foundJSDoc && commentStart < commentEnd) {
      documentation = lines.slice(commentStart, commentEnd + 1).join("\n");
    }

    // Find the function body
    let braceCount = 0;
    let inFunction = false;
    let functionEnd = startLine;

    for (let i = startLine; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes("{")) {
        braceCount += (line.match(/\{/g) || []).length;
        inFunction = true;
      }
      if (line.includes("}")) {
        braceCount -= (line.match(/\}/g) || []).length;
      }
      if (inFunction && braceCount === 0) {
        functionEnd = i;
        break;
      }
    }

    // Extract implementation
    implementation = lines.slice(startLine, functionEnd + 1).join("\n");

    // Extract full block (comments + implementation)
    fullBlock = foundJSDoc
      ? lines.slice(commentStart, functionEnd + 1).join("\n")
      : lines.slice(startLine, functionEnd + 1).join("\n");

    return { documentation, implementation, fullBlock };
  }

  /**
   * Parse TypeScript parameters
   */
  private static parseTypeScriptParameters(
    paramsStr: string
  ): TypeScriptParameter[] {
    if (!paramsStr.trim()) {
      return [];
    }

    const params = this.splitTypeScriptParameters(paramsStr);
    return params.map((param) => {
      // Match: name: type
      // Match: name?: type
      // Match: name: type = defaultValue
      const paramMatch = param.match(
        /^([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\?)?\s*(?::\s*([^=]+))?\s*(?:=\s*(.+))?$/
      );

      if (paramMatch) {
        const [, name, type, defaultValue] = paramMatch;
        return {
          name,
          type: type ? type.trim() : undefined,
          isOptional: param.includes("?"),
          defaultValue: defaultValue ? defaultValue.trim() : undefined,
        };
      }

      return {
        name: param.trim(),
        type: undefined,
        isOptional: false,
        defaultValue: undefined,
      };
    });
  }

  /**
   * Split TypeScript parameters string into individual parameters
   */
  private static splitTypeScriptParameters(params: string): string[] {
    const result: string[] = [];
    let current = "";
    let braceCount = 0;
    let bracketCount = 0;

    for (const char of params) {
      if (char === "(") braceCount++;
      else if (char === ")") braceCount--;
      else if (char === "<") bracketCount++;
      else if (char === ">") bracketCount--;
      else if (char === "," && braceCount === 0 && bracketCount === 0) {
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
   * Parse class methods from class body
   */
  private static parseClassMethods(
    classBody: string,
    startLine: number
  ): TypeScriptMethod[] {
    const methods: TypeScriptMethod[] = [];
    const lines = classBody.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match method definitions
      // public name(params): returnType
      // private name(params): returnType
      // static name(params): returnType
      // name(params): returnType
      const methodMatch = line.match(
        /^(?:public\s+|private\s+|protected\s+)?(?:static\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\s*\{?/
      );

      if (methodMatch) {
        const [, name, paramsStr, returnType] = methodMatch;
        const parameters = this.parseTypeScriptParameters(paramsStr);
        const isPublic =
          !line.includes("private") && !line.includes("protected");
        const isStatic = line.includes("static");

        methods.push({
          name,
          parameters,
          returnType: returnType ? returnType.trim() : undefined,
          isPublic,
          isStatic,
          line: startLine + i,
          raw: line,
        });
      }
    }

    return methods;
  }

  /**
   * Parse class properties from class body
   */
  private static parseClassProperties(
    classBody: string,
    startLine: number
  ): TypeScriptProperty[] {
    const properties: TypeScriptProperty[] = [];
    const lines = classBody.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Match property definitions
      // public name: type
      // private name: type
      // readonly name: type
      // static name: type
      const propertyMatch = line.match(
        /^(?:public\s+|private\s+|protected\s+)?(?:readonly\s+)?(?:static\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*([^;=]+)(?:[;=]|$)/
      );

      if (propertyMatch) {
        const [, name, type] = propertyMatch;
        const isPublic =
          !line.includes("private") && !line.includes("protected");
        const isStatic = line.includes("static");
        const isReadonly = line.includes("readonly");

        properties.push({
          name,
          type: type.trim(),
          isPublic,
          isStatic,
          isReadonly,
          line: startLine + i,
          raw: line,
        });
      }
    }

    return properties;
  }
}
