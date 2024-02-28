import { readFile, writeFile, rm, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { checkDirectory } from "./lib/utils.js";
import { minify } from "terser";

checkDirectory();

await rm("docs/playground/mqp", { recursive: true, force: true });
await mkdir("docs/playground/mqp", { recursive: true });

const toSearch = ["dist/esm"];
let directory: string | undefined;
while ((directory = toSearch.pop())) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      toSearch.push(join(directory, entry.name));
    } else if (entry.isFile() && entry.name.endsWith(".js")) {
      const filePath = join(directory, entry.name);
      const code = await readFile(filePath, "utf8");
      const result = await minify(code, { ecma: 2020, module: true });
      if (result.code) {
        const newFilePath = join("docs/playground/mqp", filePath.slice(9));
        await mkdir(join(newFilePath, ".."), { recursive: true });
        await writeFile(newFilePath, result.code);
      }
    }
  }
}
