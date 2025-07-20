const fs = require("fs");
const path = require("path");

async function generateAikenData() {
  try {
    console.log("🔍 Generating Aiken library data...");
    console.log("Current working directory:", process.cwd());
    console.log("Node version:", process.version);

    // Check if SDK dist exists
    const sdkPath = path.resolve("../packages/aiken-sdk/dist/index.js");
    console.log("SDK path:", sdkPath);
    console.log("SDK exists:", fs.existsSync(sdkPath));

    if (!fs.existsSync(sdkPath)) {
      console.error("❌ SDK dist not found. Building SDK first...");
      const { execSync } = require("child_process");
      execSync("npm run build-sdk", { stdio: "inherit" });
    }

    // Import the SDK dynamically with better error handling
    let createAikenSDK, getEnabledPackages;
    try {
      const sdkModule = await import("../packages/aiken-sdk/dist/index.js");
      createAikenSDK = sdkModule.createAikenSDK;
      getEnabledPackages = sdkModule.getEnabledPackages;
      console.log("✅ SDK imported successfully");
    } catch (importError) {
      console.error("❌ Failed to import SDK:", importError);
      throw importError;
    }

    // Get enabled packages from registry
    const enabledPackages = getEnabledPackages();
    const projectRoot = process.cwd();

    console.log(
      `📦 Found ${enabledPackages.length} enabled packages:`,
      enabledPackages.map((p) => p.id)
    );

    // Log package details for debugging
    enabledPackages.forEach((pkg) => {
      const fullPath = path.join(projectRoot, pkg.path);
      const exists = fs.existsSync(fullPath);
      console.log(`Package ${pkg.id}:`, {
        path: pkg.path,
        fullPath,
        exists,
        enabled: pkg.enabled,
      });

      // If package doesn't exist, try alternative paths for production
      if (!exists) {
        console.warn(`⚠️ Package ${pkg.id} not found at ${fullPath}`);

        // Try alternative paths for production builds
        const altPaths = [
          path.join(projectRoot, "..", pkg.path),
          path.join(projectRoot, "..", "..", pkg.path),
          path.join(process.cwd(), pkg.path),
        ];

        for (const altPath of altPaths) {
          if (fs.existsSync(altPath)) {
            console.log(
              `✅ Found package ${pkg.id} at alternative path: ${altPath}`
            );
            // Update the package path for this run
            pkg.path = altPath.replace(projectRoot, "").replace(/^\//, "");
            break;
          }
        }
      }
    });

    // Initialize SDK with packages (using original paths for build-time parsing)
    const sdk = createAikenSDK(enabledPackages);

    // Load library with all enabled sources
    console.log(
      "Loading library with sources:",
      enabledPackages.map((pkg) => pkg.id)
    );
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

    // Log module sources for debugging
    const moduleSources = new Map();
    modules.forEach((module, key) => {
      const source = key.split(":")[0];
      moduleSources.set(source, (moduleSources.get(source) || 0) + 1);
    });
    console.log("Modules by source:", Object.fromEntries(moduleSources));

    // Validate that all expected packages are present
    const expectedSources = enabledPackages.map((pkg) => pkg.id);
    const actualSources = Array.from(moduleSources.keys());
    const missingSources = expectedSources.filter(
      (source) => !actualSources.includes(source)
    );

    if (missingSources.length > 0) {
      console.warn(
        `⚠️ Missing packages in generated data: ${missingSources.join(", ")}`
      );
      console.warn("Expected sources:", expectedSources);
      console.warn("Actual sources:", actualSources);

      // Check if this is likely a submodule issue
      const submodulePackages = missingSources.filter((source) =>
        ["anastasia"].includes(source)
      );

      if (submodulePackages.length > 0) {
        console.warn(
          "💡 This appears to be a git submodule issue. Ensure submodules are fetched:"
        );
        console.warn("   git submodule update --init --recursive");
      }

      // Ensure we have at least some data
      if (actualSources.length === 0) {
        console.error(
          "❌ No packages were successfully loaded. Build may fail."
        );
        console.error(
          "   Please check that all required packages are available."
        );
      } else {
        console.log(
          `✅ Continuing with ${actualSources.length} available packages`
        );
      }
    } else {
      console.log("✅ All expected packages are present in generated data");
    }

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
    console.error("Stack trace:", error.stack);
    process.exit(1);
  }
}

generateAikenData();
