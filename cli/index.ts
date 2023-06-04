#!/usr/bin/env node
import { hello } from "../lib/index.js";

const [_cmd, _fileName, ...args] = process.argv;
const arg = args.join(" ");

if (arg !== "") {
  console.log(hello(arg));
}
