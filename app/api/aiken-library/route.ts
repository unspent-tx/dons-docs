import { NextResponse } from "next/server";
import { promises as fs } from "fs";
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

    // Read pre-generated data from JSON file
    const projectRoot = process.cwd();
    const dataPath = join(projectRoot, "public", "aiken-data.json");

    try {
      const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));

      // Cache the data
      cachedData = data;
      lastCacheTime = Date.now();

      return NextResponse.json(data);
    } catch (fileError) {
      console.error("Error reading pre-generated data:", fileError);
      return NextResponse.json(
        { error: "Pre-generated data not found. Please run build process." },
        { status: 500 }
      );
    }
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

    // Regenerate the data file
    const { execSync } = require("child_process");
    const projectRoot = process.cwd();

    try {
      execSync("node scripts/generate-aiken-data.js", {
        cwd: projectRoot,
        stdio: "inherit",
      });
      console.log("✅ Successfully regenerated Aiken data");
    } catch (buildError) {
      console.error("❌ Error regenerating data:", buildError);
      return NextResponse.json(
        { error: "Failed to regenerate data" },
        { status: 500 }
      );
    }

    // Return the fresh data
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
