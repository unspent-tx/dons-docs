// Offchain code parser for MeshJS-style packages
// Scans all .ts, .tsx, .js, .jsx files in packages/offchain-* and outputs public/offchain-data.json

const { Project, ts } = require("ts-morph");
const fs = require("fs");
const path = require("path");

defaultOffchainRoot = path.join(__dirname, "../packages/offchain");
const outputPath = path.join(__dirname, "../public/offchain-data.json");

// Utility: Recursively find all offchain package src directories
function findOffchainSrcDirs(root) {
  // Now, offchain packages are in packages/offchain/<name>/src
  return fs
    .readdirSync(root)
    .map((d) => path.join(root, d, "src"))
    .filter((srcPath) => fs.existsSync(srcPath));
}

// Utility: Recursively find all .ts, .tsx, .js, .jsx files in a directory
function findSourceFiles(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      results = results.concat(findSourceFiles(fullPath));
    } else if (/(\.ts|\.tsx|\.js|\.jsx)$/.test(entry)) {
      results.push(fullPath);
    }
  }
  return results;
}

// Main extraction logic
function extractOffchainData() {
  const srcDirs = findOffchainSrcDirs(defaultOffchainRoot);
  const files = srcDirs.flatMap(findSourceFiles);
  const project = new Project({
    tsConfigFilePath: path.join(__dirname, "../tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });
  project.addSourceFilesAtPaths(files);

  const modules = [];
  const functions = [];
  const types = [];
  const classes = [];

  for (const file of project.getSourceFiles()) {
    // New logic for clean moduleKey and importPath
    const relPath = path.relative(defaultOffchainRoot, file.getFilePath());
    // relPath: "mesh-common/src/foo.ts"
    const match = relPath.match(/^([^/\\]+)[/\\](.*)$/);
    if (!match) continue; // skip files not in offchain packages
    const cleanPackage = match[1]; // e.g. "mesh-common"
    const rest = match[2].replace(/\.[tj]sx?$/, "").replace(/[\\/]/g, ".");
    const moduleKey = `offchain:${cleanPackage}.${rest}`;
    const moduleName = path.basename(relPath, path.extname(relPath));
    const moduleSource = cleanPackage;
    const importPath = path.join("offchain", cleanPackage, match[2]);
    const moduleObj = {
      key: moduleKey,
      name: moduleName,
      source: moduleSource,
      description: "",
      functions: [],
      types: [],
      classes: [],
    };

    // Functions
    file.getFunctions().forEach((fn) => {
      if (!fn.isExported()) return;
      const sig = fn.getSignature();
      const params = sig.getParameters().map((p) => ({
        name: p.getName(),
        type: p.getTypeAtLocation(fn).getText(),
        optional: p.isOptional?.() || false,
      }));
      const returnType = sig.getReturnType().getText();
      const doc = fn
        .getJsDocs()
        .map((d) => d.getComment())
        .join("\n");
      const funcObj = {
        name: fn.getName(),
        signature: sig.getDeclaration().getText(),
        documentation: doc,
        parameters: params,
        returnType,
        isExported: true,
        importPath: importPath,
      };
      moduleObj.functions.push(funcObj);
      functions.push({ ...funcObj, module: moduleName, source: moduleSource });
    });

    // Types/Interfaces
    file.getTypeAliases().forEach((typeAlias) => {
      if (!typeAlias.isExported()) return;
      const doc = typeAlias
        .getJsDocs()
        .map((d) => d.getComment())
        .join("\n");
      const typeObj = {
        name: typeAlias.getName(),
        definition: typeAlias.getType().getText(),
        isExported: true,
        importPath: importPath,
        documentation: doc,
      };
      moduleObj.types.push(typeObj);
      types.push({ ...typeObj, module: moduleName, source: moduleSource });
    });
    file.getInterfaces().forEach((intf) => {
      if (!intf.isExported()) return;
      const doc = intf
        .getJsDocs()
        .map((d) => d.getComment())
        .join("\n");
      const typeObj = {
        name: intf.getName(),
        definition: intf.getText(),
        isExported: true,
        importPath: importPath,
        documentation: doc,
      };
      moduleObj.types.push(typeObj);
      types.push({ ...typeObj, module: moduleName, source: moduleSource });
    });

    // Classes
    file.getClasses().forEach((cls) => {
      if (!cls.isExported()) return;
      const doc = cls
        .getJsDocs()
        .map((d) => d.getComment())
        .join("\n");
      const methods = cls.getMethods().map((m) => ({
        name: m.getName(),
        signature: m.getText(),
        documentation: m
          .getJsDocs()
          .map((d) => d.getComment())
          .join("\n"),
        static: m.isStatic(),
        visibility: m.getScope() || "public",
      }));
      const properties = cls.getProperties().map((p) => ({
        name: p.getName(),
        type: p.getType().getText(),
        documentation: p
          .getJsDocs()
          .map((d) => d.getComment())
          .join("\n"),
        static: p.isStatic(),
        visibility: p.getScope() || "public",
      }));
      const classObj = {
        name: cls.getName(),
        documentation: doc,
        isExported: true,
        importPath: importPath,
        extends: cls.getExtends()?.getText() || null,
        implements: cls.getImplements().map((i) => i.getText()),
        methods,
        properties,
      };
      moduleObj.classes.push(classObj);
      classes.push({ ...classObj, module: moduleName, source: moduleSource });
    });

    modules.push(moduleObj);
  }

  // Output structure
  const output = {
    modules,
    functions,
    types,
    classes,
    stats: {
      totalModules: modules.length,
      totalFunctions: functions.length,
      totalTypes: types.length,
      totalClasses: classes.length,
      packages: [], // Optionally fill in with package stats
    },
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`Offchain data written to ${outputPath}`);
}

extractOffchainData();
