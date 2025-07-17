const fs = require("fs");
const path = require("path");

async function generateAikenData() {
  try {
    console.log("🔍 Generating Aiken library data...");

    // Import the SDK dynamically
    const { createAikenSDK, getEnabledPackages } = await import(
      "../packages/aiken-sdk/dist/index.js"
    );

    // Get enabled packages from registry
    const enabledPackages = getEnabledPackages();
    const projectRoot = process.cwd();

    console.log(
      `📦 Found ${enabledPackages.length} enabled packages:`,
      enabledPackages.map((p) => p.id)
    );

    // Initialize SDK with packages (using original paths for build-time parsing)
    const sdk = createAikenSDK(enabledPackages);

    // Load library with all enabled sources
    await sdk.loadLibrary({
      sources: enabledPackages.map((pkg) => pkg.id),
      includePrivate: true,
    });

    // Get data from all sources (same logic as API route)
    const modules = sdk.getModules();
    const functions = sdk.getAllFunctions();
    const atoms = sdk.getAllAtoms();
    const types = sdk.getAllTypes();
    const privateTypes = sdk.getAllPrivateTypes();
    const constants = sdk.getAllConstants();
    const privateConstants = sdk.getAllPrivateConstants();
    const stats = sdk.getStats();

    console.log(`✅ Parsed data:`, {
      modules: modules.size,
      functions: functions.size,
      atoms: atoms.size,
      types: types.size,
      privateTypes: privateTypes.size,
      constants: constants.size,
      privateConstants: privateConstants.size,
    });

    // Convert Maps to arrays for JSON serialization (same logic as API route)
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

    // Ensure public directory exists
    const publicDir = path.join(projectRoot, "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Write the data to a JSON file
    const outputPath = path.join(publicDir, "aiken-data.json");
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));

    console.log(`💾 Generated Aiken data: ${outputPath}`);
    console.log(`📊 Total items:`, {
      modules: data.modules.length,
      functions: data.functions.length,
      atoms: data.atoms.length,
      types: data.types.length,
      privateTypes: data.privateTypes.length,
      constants: data.constants.length,
      privateConstants: data.privateConstants.length,
    });
  } catch (error) {
    console.error("❌ Error generating Aiken data:", error);
    process.exit(1);
  }
}

generateAikenData();
