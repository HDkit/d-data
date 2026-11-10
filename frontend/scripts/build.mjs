import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const nextBin = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");

function run(args, env = process.env) {
  return spawnSync(process.execPath, [nextBin, ...args], {
    env,
    stdio: "inherit",
  });
}

let result = run(["build"]);

// Some Windows environments return a corrupt optional native SWC package. Keep the
// normal native build as the fast path and use Next's official WASM fallback only
// when native compilation cannot start.
const wasmDirectory = join(process.cwd(), "node_modules", "@next", "swc-wasm-nodejs");
if (result.status !== 0 && process.platform === "win32" && existsSync(wasmDirectory)) {
  console.warn("Native SWC was unavailable; retrying the build with Webpack and WASM SWC.");
  result = run(["build", "--webpack"], {
    ...process.env,
    NEXT_TEST_WASM_DIR: wasmDirectory,
  });
}

process.exitCode = result.status ?? 1;
