const fs = require("fs");
const path = require("path");

// Create directories in public folder
const publicDir = path.join(__dirname, "../public");
const aikenLibDir = path.join(publicDir, "aiken-lib");

// Ensure directories exist
if (!fs.existsSync(aikenLibDir)) {
  fs.mkdirSync(aikenLibDir, { recursive: true });
}

// Copy aiken-prelude files
const preludeSource = path.join(__dirname, "../packages/aiken-prelude/lib");
const preludeTarget = path.join(aikenLibDir, "aiken-prelude");
if (fs.existsSync(preludeSource)) {
  fs.cpSync(preludeSource, preludeTarget, { recursive: true });
  console.log("✓ Copied aiken-prelude files");
} else {
  console.error("✗ aiken-prelude source not found:", preludeSource);
}

// Copy aiken-vodka files
const vodkaSource = path.join(__dirname, "../packages/aiken-vodka/lib");
const vodkaTarget = path.join(aikenLibDir, "aiken-vodka");
if (fs.existsSync(vodkaSource)) {
  fs.cpSync(vodkaSource, vodkaTarget, { recursive: true });
  console.log("✓ Copied aiken-vodka files");
} else {
  console.error("✗ aiken-vodka source not found:", vodkaSource);
}

// Copy aiken-stdlib files
const stdlibSource = path.join(__dirname, "../packages/aiken-stdlib");
const stdlibTarget = path.join(aikenLibDir, "aiken-stdlib");
if (fs.existsSync(stdlibSource)) {
  fs.cpSync(stdlibSource, stdlibTarget, { recursive: true });
  console.log("✓ Copied aiken-stdlib files");
} else {
  console.error("✗ aiken-stdlib source not found:", stdlibSource);
}

// Copy aiken-design-patterns files
const designPatternsSource = path.join(
  __dirname,
  "../packages/aiken-design-patterns/lib"
);
const designPatternsTarget = path.join(aikenLibDir, "aiken-design-patterns");
if (fs.existsSync(designPatternsSource)) {
  fs.cpSync(designPatternsSource, designPatternsTarget, { recursive: true });
  console.log("✓ Copied aiken-design-patterns files");
} else {
  console.error(
    "✗ aiken-design-patterns source not found:",
    designPatternsSource
  );
}

console.log("Aiken library files copied to public folder");
