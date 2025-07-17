import { promises as fs } from "fs";
import { join, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";
import { AikenParser } from "./parser.js";
import {
  AikenLibrary,
  AikenModule,
  ParseOptions,
  SourceType,
} from "./types.js";
import {
  PACKAGE_REGISTRY,
  PackageConfig,
  getEnabledPackages,
} from "./registry.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class AikenSDK {
  private packages: Map<string, PackageConfig>;
  private library: AikenLibrary;

  constructor(packageConfigs?: PackageConfig[]) {
    this.packages = new Map();
    const configs = packageConfigs || getEnabledPackages();

    configs.forEach((config) => {
      this.packages.set(config.id, config);
    });

    this.library = this.createEmptyLibrary(configs);
  }

  private createEmptyLibrary(configs: PackageConfig[]): AikenLibrary {
    const sourceStats: any = {};
    configs.forEach((config) => {
      sourceStats[config.id] = {
        modules: 0,
        functions: 0,
        atoms: 0,
        types: 0,
        privateTypes: 0,
        constants: 0,
        privateConstants: 0,
      };
    });

    return {
      modules: new Map(),
      dependencies: new Map(),
      // Public API
      functions: new Map(),
      types: new Map(),
      constants: new Map(),
      // Private implementation
      atoms: new Map(),
      privateTypes: new Map(),
      privateConstants: new Map(),
      // Source statistics
      sourceStats,
    };
  }

  /**
   * Load and analyze Aiken libraries from multiple sources
   */
  async loadLibrary(options: ParseOptions = {}): Promise<void> {
    const sources = options.sources || Array.from(this.packages.keys());

    console.log(`Loading Aiken libraries from sources: ${sources.join(", ")}`);

    // Clear existing data
    this.clearLibrary();

    // Load each package using existing parsing logic
    for (const source of sources) {
      const pkg = this.packages.get(source);
      if (pkg && pkg.enabled) {
        try {
          const sourcePath = join(process.cwd(), pkg.path);
          console.log(`Processing package ${source} at path: ${sourcePath}`);
          await this.loadSourceLibrary(
            source as SourceType, // Use source ID as SourceType
            sourcePath,
            options
          );
          console.log(`✅ Successfully processed package ${source}`);
        } catch (error) {
          console.error(`❌ Error processing package ${source}:`, error);
          if (error instanceof Error) {
            console.error(`Stack trace for ${source}:`, error.stack);
          }
          // Continue with other packages instead of failing completely
        }
      } else {
        console.warn(`⚠️ Package ${source} not found or disabled`);
      }
    }

    // Apply custom parsing and post-processing for each package
    for (const source of sources) {
      const pkg = this.packages.get(source);
      if (pkg?.customParsing?.postProcessing) {
        for (const postProcess of pkg.customParsing.postProcessing) {
          switch (postProcess) {
            case "processVodkaReExports":
              if (source === "vodka") {
                await this.processVodkaReExports();
              }
              break;
            // Add more post-processing steps as needed
            default:
              console.warn(`Unknown post-processing step: ${postProcess}`);
          }
        }
      }
    }

    console.log(
      `Successfully loaded ${
        this.library.modules.size
      } modules from ${sources.join(", ")}`
    );
  }

  /**
   * Clear all library data
   */
  private clearLibrary(): void {
    this.library.modules.clear();
    this.library.dependencies.clear();
    this.library.functions.clear();
    this.library.types.clear();
    this.library.constants.clear();
    this.library.atoms.clear();
    this.library.privateTypes.clear();
    this.library.privateConstants.clear();

    // Reset source stats
    const configs = getEnabledPackages();
    configs.forEach((config) => {
      this.library.sourceStats[config.id] = {
        modules: 0,
        functions: 0,
        atoms: 0,
        types: 0,
        privateTypes: 0,
        constants: 0,
        privateConstants: 0,
      };
    });
  }

  /**
   * Load and analyze a specific source library
   */
  private async loadSourceLibrary(
    source: SourceType,
    sourcePath: string,
    options: ParseOptions
  ): Promise<void> {
    console.log(`Loading ${source} from: ${sourcePath}`);

    // Recursively find all .ak files
    const akFiles = await this.findAikenFiles(sourcePath, options);

    console.log(`Found ${akFiles.length} Aiken files in ${source}`);

    // Parse each file
    for (const filePath of akFiles) {
      try {
        const module = await this.parseFile(
          filePath,
          sourcePath,
          source,
          options
        );
        const moduleKey = `${source}:${module.name}`;
        this.library.modules.set(moduleKey, module);

        // Index public functions, types, and constants globally
        module.functions.forEach((func) => {
          this.library.functions.set(`${moduleKey}.${func.name}`, func);
        });

        module.types.forEach((type) => {
          this.library.types.set(`${moduleKey}.${type.name}`, type);
        });

        module.constants.forEach((constant) => {
          this.library.constants.set(`${moduleKey}.${constant.name}`, constant);
        });

        // Index private atoms, types, and constants globally if includePrivate is enabled
        if (options.includePrivate !== false) {
          module.atoms.forEach((atom) => {
            this.library.atoms.set(`${moduleKey}.${atom.name}`, atom);
          });

          module.privateTypes.forEach((type) => {
            this.library.privateTypes.set(`${moduleKey}.${type.name}`, type);
          });

          module.privateConstants.forEach((constant) => {
            this.library.privateConstants.set(
              `${moduleKey}.${constant.name}`,
              constant
            );
          });
        }

        // Track dependencies
        this.library.dependencies.set(moduleKey, module.dependencies);

        // Update source statistics
        this.library.sourceStats[source].modules++;
        this.library.sourceStats[source].functions += module.functions.length;
        this.library.sourceStats[source].atoms += module.atoms.length;
        this.library.sourceStats[source].types += module.types.length;
        this.library.sourceStats[source].privateTypes +=
          module.privateTypes.length;
        this.library.sourceStats[source].constants += module.constants.length;
        this.library.sourceStats[source].privateConstants +=
          module.privateConstants.length;
      } catch (error) {
        console.error(`Error parsing file ${filePath}:`, error);
      }
    }
  }

  /**
   * Process vodka re-export relationships
   */
  private async processVodkaReExports(): Promise<void> {
    console.log("Processing vodka re-export relationships...");

    // Get vodka cocktail and mocktail modules
    const cocktailModule = this.library.modules.get("vodka:cocktail");
    const mocktailModule = this.library.modules.get("vodka:mocktail");

    if (cocktailModule) {
      const reExports = AikenParser.parseVodkaReExports(
        cocktailModule.content,
        "cocktail"
      );
      this.updateVodkaReExports(reExports, "cocktail");
    }

    if (mocktailModule) {
      const reExports = AikenParser.parseVodkaReExports(
        mocktailModule.content,
        "mocktail"
      );
      this.updateVodkaReExports(reExports, "mocktail");
    }
  }

  /**
   * Update vodka functions with re-export information
   */
  private updateVodkaReExports(
    reExports: Map<string, string>,
    moduleType: "cocktail" | "mocktail"
  ): void {
    reExports.forEach((exportedName, originalFunction) => {
      // Find the original function in vodka modules
      const [originalModule, originalFunctionName] =
        originalFunction.split(".");

      this.library.functions.forEach((func, key) => {
        if (
          func.source === "vodka" &&
          key.includes(originalModule) &&
          func.name === originalFunctionName
        ) {
          // Add re-export information
          if (!func.reExportedAs) {
            func.reExportedAs = [];
          }
          func.reExportedAs.push(`${moduleType}.${exportedName}`);
        }
      });

      this.library.atoms.forEach((atom, key) => {
        if (
          atom.source === "vodka" &&
          key.includes(originalModule) &&
          atom.name === originalFunctionName
        ) {
          // Add re-export information
          if (!atom.reExportedAs) {
            atom.reExportedAs = [];
          }
          atom.reExportedAs.push(`${moduleType}.${exportedName}`);
        }
      });
    });
  }

  /**
   * Recursively find all .ak files in the given directory
   */
  private async findAikenFiles(
    dir: string,
    options: ParseOptions
  ): Promise<string[]> {
    const files: string[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subFiles = await this.findAikenFiles(fullPath, options);
          files.push(...subFiles);
        } else if (entry.isFile() && extname(entry.name) === ".ak") {
          // Check if we should include test files
          if (!options.includeTests && entry.name.includes(".test.")) {
            continue;
          }

          files.push(fullPath);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${dir}:`, error);
    }

    return files;
  }

  /**
   * Parse a single Aiken file
   */
  private async parseFile(
    filePath: string,
    basePath: string,
    source: SourceType,
    options: ParseOptions = {}
  ): Promise<AikenModule> {
    const content = await fs.readFile(filePath, "utf-8");
    const relativePath = filePath.replace(basePath, "").replace(/^\//, "");
    const moduleName = this.getModuleName(relativePath);

    // Parse different elements with source information
    const imports = AikenParser.parseImports(content, source);
    const allFunctions = AikenParser.parseFunctions(content, source);
    const allTypes = AikenParser.parseTypes(content, source);
    const allConstants = AikenParser.parseConstants(content, source);
    const dependencies = AikenParser.extractDependencies(imports);

    // Separate public API from private implementation
    const functions = allFunctions.filter((func) => func.isPublic);
    const atoms = allFunctions.filter((func) => !func.isPublic);

    const types = allTypes.filter((type) => type.isPublic);
    const privateTypes = allTypes.filter((type) => !type.isPublic);

    const constants = allConstants.filter((constant) => constant.isPublic);
    const privateConstants = allConstants.filter(
      (constant) => !constant.isPublic
    );

    // Check if this is a re-export file for vodka
    const isReExportFile = AikenParser.isVodkaReExportFile(moduleName, source);

    return {
      path: filePath,
      name: moduleName,
      imports,
      functions,
      types,
      constants,
      atoms,
      privateTypes,
      privateConstants,
      content,
      dependencies,
      source,
      isReExportFile,
    };
  }

  /**
   * Convert file path to module name
   */
  private getModuleName(relativePath: string): string {
    return relativePath
      .replace(/\\/g, "/")
      .replace(/\.ak$/, "")
      .replace(/\//g, ".");
  }

  /**
   * Get all modules
   */
  getModules(): Map<string, AikenModule> {
    return this.library.modules;
  }

  /**
   * Get modules by source
   */
  getModulesBySource(source: SourceType): Map<string, AikenModule> {
    const result = new Map<string, AikenModule>();
    this.library.modules.forEach((module, key) => {
      if (module.source === source) {
        result.set(key, module);
      }
    });
    return result;
  }

  /**
   * Get a specific module by name
   */
  getModule(name: string): AikenModule | undefined {
    return this.library.modules.get(name);
  }

  /**
   * Get all public functions from all modules
   */
  getAllFunctions(): Map<string, any> {
    return this.library.functions;
  }

  /**
   * Get all private functions (atoms) from all modules
   */
  getAllAtoms(): Map<string, any> {
    return this.library.atoms;
  }

  /**
   * Get functions by source
   */
  getFunctionsBySource(source: SourceType): Map<string, any> {
    const result = new Map();
    this.library.functions.forEach((func, key) => {
      if (func.source === source) {
        result.set(key, func);
      }
    });
    return result;
  }

  /**
   * Get atoms by source
   */
  getAtomsBySource(source: SourceType): Map<string, any> {
    const result = new Map();
    this.library.atoms.forEach((atom, key) => {
      if (atom.source === source) {
        result.set(key, atom);
      }
    });
    return result;
  }

  /**
   * Get public functions by module name
   */
  getFunctionsByModule(moduleName: string): any[] {
    const module = this.library.modules.get(moduleName);
    return module ? module.functions : [];
  }

  /**
   * Get private functions (atoms) by module name
   */
  getAtomsByModule(moduleName: string): any[] {
    const module = this.library.modules.get(moduleName);
    return module ? module.atoms : [];
  }

  /**
   * Search for public functions by name pattern
   */
  searchFunctions(pattern: string): any[] {
    const results: any[] = [];
    const regex = new RegExp(pattern, "i");

    this.library.functions.forEach((func, fullName) => {
      if (regex.test(func.name) || regex.test(fullName)) {
        results.push({ fullName, ...func });
      }
    });

    return results;
  }

  /**
   * Search for private functions (atoms) by name pattern
   */
  searchAtoms(pattern: string): any[] {
    const results: any[] = [];
    const regex = new RegExp(pattern, "i");

    this.library.atoms.forEach((atom, fullName) => {
      if (regex.test(atom.name) || regex.test(fullName)) {
        results.push({ fullName, ...atom });
      }
    });

    return results;
  }

  /**
   * Get all public types from all modules
   */
  getAllTypes(): Map<string, any> {
    return this.library.types;
  }

  /**
   * Get all private types from all modules
   */
  getAllPrivateTypes(): Map<string, any> {
    return this.library.privateTypes;
  }

  /**
   * Get types by source
   */
  getTypesBySource(source: SourceType): Map<string, any> {
    const result = new Map();
    this.library.types.forEach((type, key) => {
      if (type.source === source) {
        result.set(key, type);
      }
    });
    return result;
  }

  /**
   * Get all public constants from all modules
   */
  getAllConstants(): Map<string, any> {
    return this.library.constants;
  }

  /**
   * Get all private constants from all modules
   */
  getAllPrivateConstants(): Map<string, any> {
    return this.library.privateConstants;
  }

  /**
   * Get constants by source
   */
  getConstantsBySource(source: SourceType): Map<string, any> {
    const result = new Map();
    this.library.constants.forEach((constant, key) => {
      if (constant.source === source) {
        result.set(key, constant);
      }
    });
    return result;
  }

  /**
   * Get dependency tree for a module
   */
  getDependencyTree(moduleName: string): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const traverse = (name: string) => {
      if (visited.has(name)) return;
      visited.add(name);

      const deps = this.library.dependencies.get(name) || [];
      deps.forEach((dep) => traverse(dep));

      result.push(name);
    };

    traverse(moduleName);
    return result;
  }

  /**
   * Get modules that depend on a specific module
   */
  getReverseDependencies(moduleName: string): string[] {
    const result: string[] = [];

    this.library.dependencies.forEach((deps, name) => {
      if (deps.includes(moduleName)) {
        result.push(name);
      }
    });

    return result;
  }

  /**
   * Get library statistics
   */
  getStats(): {
    totalModules: number;
    totalFunctions: number;
    totalAtoms: number;
    totalTypes: number;
    totalPrivateTypes: number;
    totalConstants: number;
    totalPrivateConstants: number;
    totalDependencies: number;
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
  } {
    return {
      totalModules: this.library.modules.size,
      totalFunctions: this.library.functions.size,
      totalAtoms: this.library.atoms.size,
      totalTypes: this.library.types.size,
      totalPrivateTypes: this.library.privateTypes.size,
      totalConstants: this.library.constants.size,
      totalPrivateConstants: this.library.privateConstants.size,
      totalDependencies: this.library.dependencies.size,
      sourceStats: this.library.sourceStats,
    };
  }

  /**
   * Export the entire library as JSON
   */
  exportLibrary(): any {
    return {
      modules: Array.from(this.library.modules.entries()),
      dependencies: Array.from(this.library.dependencies.entries()),
      functions: Array.from(this.library.functions.entries()),
      atoms: Array.from(this.library.atoms.entries()),
      types: Array.from(this.library.types.entries()),
      privateTypes: Array.from(this.library.privateTypes.entries()),
      constants: Array.from(this.library.constants.entries()),
      privateConstants: Array.from(this.library.privateConstants.entries()),
      sourceStats: this.library.sourceStats,
    };
  }
}
