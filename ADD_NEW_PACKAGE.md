# How to Add a New Package

This guide explains how to add a new package to the registry-based architecture in this project. Follow these steps to ensure your package is fully integrated into the build, API, and UI.

---

## 1. Add Your Package Source

- Place your new package in the `packages/` directory, following the structure of existing packages.
- Example: `packages/aiken-new-package/lib/`

---

## 2. Register the Package in the Registry

### Server-side (for parsing, API, and scripts)

- **File:** [`packages/aiken-sdk/src/registry.ts`](packages/aiken-sdk/src/registry.ts)
- **What to do:**
  - Add a new entry to the `PACKAGE_REGISTRY` array.
  - Set the `id`, `name`, `description`, `icon`, `path`, `publicPath`, `enabled`, `priority`, and `parsingStrategy` fields.
  - If your package needs custom parsing, add a `customParsing` object.

**Example:**

```ts
{
  id: "new-package",
  name: "New Package",
  description: "Description of the new package",
  icon: "IconCode",
  path: "packages/aiken-new-package/lib",
  publicPath: "public/aiken-lib/aiken-new-package",
  enabled: true,
  priority: 5,
  parsingStrategy: "anastasia", // Or your custom strategy
  customParsing: {
    specialHandling: ["custom-imports"],
    postProcessing: ["processNewPackageReExports"],
  },
},
```

---

## 3. Update the Client-side Registry

- **File:** [`app/lib/client-registry.ts`](app/lib/client-registry.ts)
- **What to do:**
  - Add a new entry to the `CLIENT_PACKAGE_REGISTRY` array with `id`, `name`, `description`, `icon`, and `priority`.

**Example:**

```ts
{
  id: "new-package",
  name: "New Package",
  description: "Description of the new package",
  icon: "IconCode",
  priority: 5,
},
```

---

## 4. (Optional) Add a Custom Parsing Strategy

- **File:** [`packages/aiken-sdk/src/parser.ts`](packages/aiken-sdk/src/parser.ts)
- **What to do:**
  - If your package requires unique parsing, add new static methods to the `AikenParser` class.
  - Update the `parsingStrategy` type in the registry and use your new methods as needed.

---

## 5. Build and Copy the Package

- **File:** [`scripts/copy-aiken-files.js`](scripts/copy-aiken-files.js)
- **What to do:**
  - No manual update needed. The script will automatically copy all enabled packages from the registry.
  - Run: `npm run build` (which runs the copy script as part of the build process)

---

## 6. API and UI Updates

- **API:** [`app/api/aiken-library/route.ts`](app/api/aiken-library/route.ts)
  - No manual update needed. The API will automatically include all enabled packages from the registry.
- **UI:**
  - Components like [`app/components/search-filters.tsx`](app/components/search-filters.tsx), [`app/components/stats-grid.tsx`](app/components/stats-grid.tsx), and [`app/page.tsx`](app/page.tsx) will automatically update to include your new package if you updated the client registry.

---

## 7. Test Everything

- Run the dev server: `npm run dev`
- Check the UI for your new package in filters, stats, and search.
- Check the API response at `/api/aiken-library` for your new package's data.

---

## Summary Table

| Step | File                                                                       | What to Update                                        |
| ---- | -------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1    | `packages/`                                                                | Add your package source code                          |
| 2    | [`packages/aiken-sdk/src/registry.ts`](packages/aiken-sdk/src/registry.ts) | Add to `PACKAGE_REGISTRY`                             |
| 3    | [`app/lib/client-registry.ts`](app/lib/client-registry.ts)                 | Add to `CLIENT_PACKAGE_REGISTRY`                      |
| 4    | [`packages/aiken-sdk/src/parser.ts`](packages/aiken-sdk/src/parser.ts)     | (Optional) Add custom parsing                         |
| 5    | [`scripts/copy-aiken-files.js`](scripts/copy-aiken-files.js)               | No manual update needed                               |
| 6    | [`app/api/aiken-library/route.ts`](app/api/aiken-library/route.ts)         | No manual update needed                               |
| 6    | UI Components                                                              | No manual update needed if client registry is updated |

---

## Troubleshooting

- If your package doesn't show up in the UI, check that it's enabled in both registries and that the build/copy script ran successfully.
- For custom parsing, ensure your strategy is implemented and referenced in the registry.

---

**That's it!**

Adding a new package is now as simple as updating the registries and (optionally) adding custom parsing logic. The rest of the system will update automatically.
