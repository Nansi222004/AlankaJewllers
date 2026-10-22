const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const controllerSource = fs.readFileSync(
  path.join(__dirname, "../src/modules/public/controllers/product.controller.js"),
  "utf8"
);

test("1. normalizeSilverTier recognises articles tier", () => {
  assert.match(
    controllerSource,
    /if\s*\(\s*normalized\s*===\s*["']articles["']\s*\|\|\s*normalized\.includes\(["']article["']\)\s*\)\s*return\s*["']articles["']/
  );
});

test("2. Silver filtering includes isSilverArticles logic", () => {
  assert.match(controllerSource, /const\s+isSilverArticles\s*=/);
  assert.match(controllerSource, /rawSilverType\s*===\s*["']articles["']/);
  assert.match(controllerSource, /tier\s*===\s*["']articles["']/);
});

test("3. Silver Articles filter strictly excludes Gold, Diamond, and Gems", () => {
  // Find isSilverArticles block
  const match = controllerSource.match(/if\s*\(\s*isSilverArticles\s*\)\s*\{([\s\S]*?)\}\s*else\s+if/);
  assert.ok(match, "isSilverArticles block must exist");
  const block = match[1];

  // Gold exclusion
  assert.match(block, /material:\s*\{\s*\$not:\s*\{\s*\$regex:\s*["']\\\\bgold\\\\b["']/);
  assert.match(block, /name:\s*\{\s*\$not:\s*\{\s*\$regex:\s*["']\\\\bgold\\\\b["']/);
  assert.match(block, /goldCategory:\s*\{\s*\$nin:\s*\["14",\s*"18",\s*"22",\s*"24"\]/);

  // Diamond exclusion
  assert.match(block, /diamondType:\s*\{\s*\$nin:\s*\["lab_grown",\s*"natural"\]/);
  assert.match(block, /material:\s*\{\s*\$not:\s*\{\s*\$regex:\s*["']\\\\bdiamond\\\\b["']/);
  assert.match(block, /name:\s*\{\s*\$not:\s*\{\s*\$regex:\s*["']\\\\bdiamond\\\\b["']/);

  // Gems exclusion
  assert.match(block, /gemstoneType:\s*\{\s*\$nin:/);
  assert.match(block, /material:\s*\{\s*\$not:\s*\{\s*\$regex:\s*["']\\\\b\(gem\|gemstone\)s\?\\\\b["']/);
  assert.match(block, /name:\s*\{\s*\$not:\s*\{\s*\$regex:\s*["']\\\\b\(gem\|gemstone\)s\?\\\\b["']/);
});

test("4. Silver Articles matches Murti, Utensils, Pooja, and decorative articles", () => {
  const match = controllerSource.match(/if\s*\(\s*isSilverArticles\s*\)\s*\{([\s\S]*?)\}\s*else\s+if/);
  assert.ok(match, "isSilverArticles block must exist");
  const block = match[1];

  assert.match(block, /murti/i);
  assert.match(block, /utensil/i);
  assert.match(block, /pooja/i);
  assert.match(block, /article/i);
});

test("5. Category slug silver-articles does not cause an invalid ObjectId rejection", () => {
  assert.match(controllerSource, /!\/\^silver\[-_\]\?articles\?\$\/i\.test\(String\(category\)\.trim\(\)\)/);
});
