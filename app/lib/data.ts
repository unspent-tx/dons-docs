// Static data access layer - loads pre-generated JSON files
// This eliminates the API dependency and works reliably in all environments

export interface AikenData {
  modules: Array<{
    key: string;
    name: string;
    source: string;
    description?: string;
    functions: string[];
    types: string[];
    constants: string[];
  }>;
  functions: Array<{
    key: string;
    fullName: string;
    name: string;
    module: string;
    source: string;
    signature: string;
    description?: string;
    parameters: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
    returnType: string;
    examples?: string[];
  }>;
  atoms: Array<{
    key: string;
    fullName: string;
    name: string;
    module: string;
    source: string;
    value: string;
    description?: string;
  }>;
  types: Array<{
    key: string;
    fullName: string;
    name: string;
    module: string;
    source: string;
    kind: string;
    description?: string;
    constructors?: Array<{
      name: string;
      parameters: Array<{
        name: string;
        type: string;
      }>;
    }>;
    fields?: Array<{
      name: string;
      type: string;
      description?: string;
    }>;
  }>;
  privateTypes: Array<{
    key: string;
    fullName: string;
    name: string;
    module: string;
    source: string;
    kind: string;
    description?: string;
  }>;
  constants: Array<{
    key: string;
    fullName: string;
    name: string;
    module: string;
    source: string;
    value: string;
    description?: string;
  }>;
  privateConstants: Array<{
    key: string;
    fullName: string;
    name: string;
    module: string;
    source: string;
    value: string;
    description?: string;
  }>;
  stats: {
    totalModules: number;
    totalFunctions: number;
    totalTypes: number;
    totalConstants: number;
    totalAtoms: number;
    packages: Array<{
      id: string;
      name: string;
      modules: number;
      functions: number;
      types: number;
      constants: number;
    }>;
  };
}

let cachedData: AikenData | null = null;

export async function loadAikenData(): Promise<AikenData> {
  if (cachedData) {
    return cachedData;
  }

  try {
    // In development, try to load from the public directory
    if (process.env.NODE_ENV === "development") {
      const response = await fetch("/aiken-data.json");
      if (response.ok) {
        const data = await response.json();
        cachedData = data;
        return data;
      }
    }

    // In production, the JSON file should be available as a static asset
    const response = await fetch("/aiken-data.json");
    if (!response.ok) {
      throw new Error(`Failed to load aiken-data.json: ${response.status}`);
    }

    const data = await response.json();
    cachedData = data;
    return data;
  } catch (error) {
    console.error("Failed to load Aiken data:", error);
    throw new Error(
      "Aiken data not available. Please ensure the build process completed successfully."
    );
  }
}

// Helper functions for filtering and searching
export async function getModulesByPackage(packageId: string) {
  const data = await loadAikenData();
  return data.modules.filter((module) => module.source === packageId);
}

export async function getFunctionsByModule(moduleName: string) {
  const data = await loadAikenData();
  return data.functions.filter((func) => func.module === moduleName);
}

export async function getTypesByModule(moduleName: string) {
  const data = await loadAikenData();
  return data.types.filter((type) => type.module === moduleName);
}

export async function searchAikenData(query: string) {
  const data = await loadAikenData();
  const lowerQuery = query.toLowerCase();

  return {
    functions: data.functions.filter(
      (func) =>
        func.name.toLowerCase().includes(lowerQuery) ||
        func.fullName.toLowerCase().includes(lowerQuery) ||
        func.description?.toLowerCase().includes(lowerQuery)
    ),
    types: data.types.filter(
      (type) =>
        type.name.toLowerCase().includes(lowerQuery) ||
        type.fullName.toLowerCase().includes(lowerQuery) ||
        type.description?.toLowerCase().includes(lowerQuery)
    ),
    constants: data.constants.filter(
      (constant) =>
        constant.name.toLowerCase().includes(lowerQuery) ||
        constant.fullName.toLowerCase().includes(lowerQuery) ||
        constant.description?.toLowerCase().includes(lowerQuery)
    ),
    modules: data.modules.filter(
      (module) =>
        module.name.toLowerCase().includes(lowerQuery) ||
        module.description?.toLowerCase().includes(lowerQuery)
    ),
  };
}
