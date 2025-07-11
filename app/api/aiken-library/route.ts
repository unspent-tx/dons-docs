import { NextResponse } from "next/server";
import { createAikenSDK } from "@dons-docs/aiken-sdk";

let cachedData: any = null;
let lastCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Return cached data if available and not expired
    if (cachedData && lastCacheTime > Date.now() - CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    // Initialize SDK with all three sources
    const sdk = createAikenSDK();

    // Load library with all sources including vodka
    await sdk.loadLibrary({
      sources: ["stdlib", "prelude", "vodka"],
      includePrivate: true,
    });

    // Get data from all sources
    const modules = sdk.getModules();
    const functions = sdk.getAllFunctions();
    const atoms = sdk.getAllAtoms();
    const types = sdk.getAllTypes();
    const privateTypes = sdk.getAllPrivateTypes();
    const constants = sdk.getAllConstants();
    const privateConstants = sdk.getAllPrivateConstants();
    const stats = sdk.getStats();

    // Convert Maps to arrays for JSON serialization
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

    return NextResponse.json(data);
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
