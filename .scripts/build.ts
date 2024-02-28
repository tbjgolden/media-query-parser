import { readFile, writeFile, rm, mkdir, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join } from "node:path";
import { checkDirectory, getPackageJson, readJSON } from "./lib/utils.js";
import { minify } from "terser";
import { format } from "prettier";

checkDirectory();

await rm("dist", { recursive: true, force: true });
await mkdir("dist/cjs", { recursive: true });
await mkdir("dist/esm", { recursive: true });

const origPkgJsonText = await readFile("package.json", "utf8");
const pkgJson = await getPackageJson();

type TSConfig = {
  compilerOptions: { [args: string]: unknown };
  include?: string[];
  exclude?: string[];
  [args: string]: unknown;
};
const tsconfigJson = readJSON<TSConfig>(await readFile("tsconfig.json", "utf8"));
const buildTsconfig: TSConfig = {
  ...tsconfigJson,
  exclude: [...(tsconfigJson.exclude ?? []), "**/*.test.ts"],
  include: (tsconfigJson.include ?? []).filter((path) => !path.startsWith(".")),
  compilerOptions: { ...tsconfigJson.compilerOptions, noEmit: false },
};
// Build ESM
await writeFile("tsconfig.esm.json", JSON.stringify(buildTsconfig));
await new Promise<void>((resolve, reject) => {
  const child = spawn("npx", ["tsc", "--project", "tsconfig.esm.json"]);
  child.on("exit", async (code) => {
    if (code) reject(new Error(`Error code: ${code}`));
    else resolve();
  });
});
await rm("tsconfig.esm.json");

// Build CJS
await writeFile(
  "tsconfig.cjs.json",
  JSON.stringify({
    ...buildTsconfig,
    compilerOptions: { ...buildTsconfig.compilerOptions, outDir: "dist/cjs", target: "es6" },
  }),
);
await writeFile("package.json", JSON.stringify({ ...pkgJson, type: "commonjs" }));
await new Promise<void>((resolve, reject) => {
  const child = spawn("npx", ["tsc", "--project", "tsconfig.cjs.json"]);
  child.on("exit", async (code) => {
    if (code) reject(new Error(`Error code: ${code}`));
    else resolve();
  });
});
await writeFile("dist/cjs/package.json", `{\n  "type": "commonjs"\n}\n`);
await rm("tsconfig.cjs.json");
await writeFile("package.json", origPkgJsonText);

const toSearch = ["dist"];
let directory: string | undefined;
while ((directory = toSearch.pop())) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      toSearch.push(join(directory, entry.name));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const filePath = join(directory, entry.name);
      let code = await readFile(filePath, "utf8");
      if (filePath === "dist/esm/index.js" || filePath === "dist/cjs/index.js") {
        code = `/*! v${pkgJson.version} */\n` + code;
      }

      const result = await minify(code, { ecma: 2020, module: true });
      if (result.code) {
        await writeFile(
          filePath,
          await format(result.code, {
            printWidth: 100,
            useTabs: true,
            parser: "babel",
            semi: false,
            singleQuote: true,
            trailingComma: "none",
            bracketSpacing: false,
            proseWrap: "always",
            arrowParens: "avoid",
            endOfLine: "lf",
            quoteProps: "as-needed",
          }),
        );
      }
    }
  }
}
