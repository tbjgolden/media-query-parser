import { getPackageJson, checkDirectory, isFile, isDirectory } from "./lib/utils.js";

checkDirectory();

const packageJson = await getPackageJson();

if (await isDirectory("lib")) {
  console.log("validating api...");

  let entrypoint: string | undefined;
  if (packageJson.exports) {
    if (packageJson.exports.startsWith("./")) {
      entrypoint = packageJson.exports.slice(2);
    } else {
      console.log("package.json exports must start with './'");
      process.exit(1);
    }
  } else if (packageJson.main) {
    entrypoint = packageJson.main;
  } else {
    console.log("package.json exports field or main field must be specified");
    process.exit(1);
  }
  if (!(await isFile(entrypoint))) {
    console.log(`entrypoint file "${entrypoint}" doesn't exist`);
    process.exit(1);
  }
  const { parseMediaQuery } = await import(process.cwd() + "/" + entrypoint);
  const result = JSON.stringify(parseMediaQuery("(monochrome)"));
  const expected = JSON.stringify({
    n: "query",
    condition: {
      n: "condition",
      op: "and",
      a: { n: "in-parens", v: { n: "feature", t: "boolean", f: "monochrome" } },
    },
  });
  if (result !== expected) {
    console.log("expected:");
    console.log(expected);
    console.log("actual:");
    console.log(result);
    process.exit(1);
  }
}
