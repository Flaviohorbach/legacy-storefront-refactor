// Downloads the legacy store (Aviato by Themefisher, MIT) at a pinned commit into legacy/.
// The theme's demo photos are not licensed for redistribution, so the legacy
// code is fetched for measurement and never committed to this repository.
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const REPO = "https://github.com/themefisher/aviato-bootstrap.git";
const COMMIT = "df6686f8cd7756393d65aae3fa23b9257985765a"; // 2025-10-09
const target = join(import.meta.dirname, "..", "legacy");

if (existsSync(join(target, "index.html"))) {
  console.log("legacy/ already present");
} else {
  const tmp = mkdtempSync(join(tmpdir(), "aviato-"));
  const git = (...args) => execFileSync("git", args, { cwd: tmp, stdio: "inherit" });
  git("init", "-q");
  git("fetch", "-q", "--depth", "1", REPO, COMMIT);
  git("checkout", "-q", "FETCH_HEAD");
  cpSync(join(tmp, "theme"), target, { recursive: true });
  rmSync(tmp, { recursive: true, force: true });
  console.log(`legacy/ ready (aviato-bootstrap@${COMMIT.slice(0, 7)})`);
}
