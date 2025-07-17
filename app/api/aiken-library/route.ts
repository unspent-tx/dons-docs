import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Read pre-generated data from JSON file
    const projectRoot = process.cwd();
    const dataPath = join(projectRoot, "public", "aiken-data.json");

    try {
      const data = JSON.parse(await fs.readFile(dataPath, "utf-8"));
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
