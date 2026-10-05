import { access, readdir } from "node:fs/promises";

const tests = (await readdir(new URL("../test/", import.meta.url))).filter((n) => n.endsWith(".test.ts"));
if (tests.length === 0) {
  throw new Error("M0 release gate: zero test files found. Docker context is incomplete.");
}
if (!tests.includes("m0Privacy.test.ts")) {
  throw new Error("M0 release gate: targeted privacy regression test is missing.");
}
await access(new URL("../bench/run.mts", import.meta.url));
console.log(`M0 validation inputs present: ${tests.length} test files + bench/run.mts`);
