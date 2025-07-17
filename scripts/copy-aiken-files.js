const fs = require("fs");
const path = require("path");

async function copyPackages() {
  // Import registry using dynamic import
  const { PACKAGE_REGISTRY } = await import(
    "../packages/aiken-sdk/dist/registry.js"
  );

  const publicDir = path.join(__dirname, "../public");
  const aikenLibDir = path.join(publicDir, "aiken-lib");

  // Ensure directories exist
  if (!fs.existsSync(aikenLibDir)) {
    fs.mkdirSync(aikenLibDir, { recursive: true });
  }

  // Copy packages from registry
  for (const pkg of PACKAGE_REGISTRY.filter((p) => p.enabled)) {
    const source = path.join(__dirname, "..", pkg.path);
    const target = path.join(__dirname, "..", pkg.publicPath);

    if (fs.existsSync(source)) {
      fs.cpSync(source, target, { recursive: true });
      console.log(`✓ Copied ${pkg.name} files`);
    } else {
      console.error(`✗ ${pkg.name} source not found:`, source);
    }
  }

  console.log("Aiken library files copied to public folder");
}

copyPackages().catch(console.error);
