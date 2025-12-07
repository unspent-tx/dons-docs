const fs = require("fs");
const path = require("path");

async function copyOffchainPackages() {
  // Import registry using dynamic import
  const { PACKAGE_REGISTRY } = await import(
    "../packages/aiken-sdk/dist/registry.js"
  );

  const publicDir = path.join(__dirname, "../public");
  const offchainLibDir = path.join(publicDir, "offchain-lib");

  // Ensure directories exist
  if (!fs.existsSync(offchainLibDir)) {
    fs.mkdirSync(offchainLibDir, { recursive: true });
  }

  // Copy offchain packages from registry
  for (const pkg of PACKAGE_REGISTRY.filter((p) => p.enabled && p.parsingStrategy === "offchain")) {
    const source = path.join(__dirname, "..", pkg.path);
    const target = path.join(__dirname, "..", pkg.publicPath);

    if (fs.existsSync(source)) {
      fs.cpSync(source, target, { recursive: true });
      console.log(`✓ Copied ${pkg.name} files`);
    } else {
      console.error(`✗ ${pkg.name} source not found:`, source);
    }
  }

  console.log("Offchain library files copied to public folder");
}

copyOffchainPackages().catch(console.error); 