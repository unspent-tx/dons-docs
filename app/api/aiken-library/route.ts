import { NextResponse } from "next/server";
import { createAikenSDK, getEnabledPackages } from "@dons-docs/aiken-sdk";
import { join } from "path";

let cachedData: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Return cached data if available and not expired
    if (cachedData && lastCacheTime > Date.now() - CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Get enabled packages from registry
    const enabledPackages = getEnabledPackages();
    const projectRoot = process.cwd();

    const debugInfo: any = {
      projectRoot,
      enabledPackages: enabledPackages.map((p) => ({
        id: p.id,
        path: p.path,
        publicPath: p.publicPath,
      })),
    };

    // Create modified package configs that use public paths for production compatibility
    const productionPackages = enabledPackages.map((pkg) => ({
      ...pkg,
      path: pkg.publicPath, // Use publicPath instead of path for production
    }));

    debugInfo.productionPackages = productionPackages.map((p) => ({
      id: p.id,
      path: p.path,
    }));

    // Initialize SDK with modified registry that uses public paths
    const sdk = createAikenSDK(productionPackages);

    // Load library with all enabled sources
    await sdk.loadLibrary({
      sources: enabledPackages.map((pkg) => pkg.id),
      includePrivate: true,
    });

    // Get data from all sources (existing logic)
    const modules = sdk.getModules();
    const functions = sdk.getAllFunctions();
    const atoms = sdk.getAllAtoms();
    const types = sdk.getAllTypes();
    const privateTypes = sdk.getAllPrivateTypes();
    const constants = sdk.getAllConstants();
    const privateConstants = sdk.getAllPrivateConstants();
    const stats = sdk.getStats();

    debugInfo.loadedData = {
      modules: modules.size,
      functions: functions.size,
      atoms: atoms.size,
      types: types.size,
      privateTypes: privateTypes.size,
      constants: constants.size,
      privateConstants: privateConstants.size,
      stats,
    };

    // Convert Maps to arrays for JSON serialization (existing logic)
    const data = {
      modules: Array.from(modules.entries()).map(([key, module]) => ({
        key,
        ...module,
      })),
      functions: Array.from(functions.entries()).map(([key, func]) => ({
        key,
        fullName: key,
        ...func,
      })),
      atoms: Array.from(atoms.entries()).map(([key, atom]) => ({
        key,
        fullName: key,
        ...atom,
      })),
      types: Array.from(types.entries()).map(([key, type]) => ({
        key,
        fullName: key,
        ...type,
      })),
      privateTypes: Array.from(privateTypes.entries()).map(([key, type]) => ({
        key,
        fullName: key,
        ...type,
      })),
      constants: Array.from(constants.entries()).map(([key, constant]) => ({
        key,
        fullName: key,
        ...constant,
      })),
      privateConstants: Array.from(privateConstants.entries()).map(
        ([key, constant]) => ({
          key,
          fullName: key,
          ...constant,
        })
      ),
      stats,
    };

    // Cache the data
    cachedData = data;
    lastCacheTime = Date.now();

    return NextResponse.json({ ...data, debugInfo });
  } catch (error) {
    console.error("Error loading Aiken library:", error);
    return NextResponse.json(
      { error: "Failed to load library" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Force refresh the library data
    cachedData = null;
    lastCacheTime = 0;

    // Reload the library
    const response = await GET();
    return response;
  } catch (error) {
    console.error("Error refreshing Aiken library:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh Aiken library",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
