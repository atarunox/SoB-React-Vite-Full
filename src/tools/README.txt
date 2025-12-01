Town Tools (codemods)

Included:
1) tools/fix-town-imports.mjs
   - Adds explicit ".js" to any relative import that points inside src/data/townLocations/...
   - Prevents Vite 500s caused by ambiguous file vs folder names.

2) tools/check-balance.mjs
   - Lists any source files with mismatched (), [], {} counts (quick heuristic).

How to use:
1) Unzip this into your project root (so you have a top-level "tools" folder next to "src").

2) Run the import fixer:
   node tools/fix-town-imports.mjs

   - It walks ./src and rewrites only imports that match:
     from './.../townLocations/...'
   - If an import already ends with ".js" or ".jsx", it is left alone.

3) Run the balance checker:
   node tools/check-balance.mjs

   - If there are offenders, it prints an array of objects like:
     [{ "file": "src/...", "brace": 1, "bracket": 0, "paren": -1 }]
   - Fix those files (often a stray comma/quote).

4) (Optional) Auto-format:
   npx prettier "src/**/*.{js,jsx,ts,tsx}" --write
   node tools/check-balance.mjs

Notes:
- These scripts assume your code lives under ./src
- They do not modify anything outside ./src
