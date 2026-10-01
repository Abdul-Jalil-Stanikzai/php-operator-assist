const test = require("node:test");
const assert = require("node:assert/strict");
const { getDotReplacement } = require("../src/converter");

function converts(line, whole = line, options = {}) {
  return getDotReplacement({ lineBeforeDot: line, textBeforeDot: whole, ...options });
}

test("converts a dot after a PHP variable or object chain", () => {
  assert.equal(converts("$user"), "->");
  assert.equal(converts("    $user"), "->");
  assert.equal(converts("{{ $user"), "->");
  assert.equal(converts("        $user->profile"), "->");
  assert.equal(converts("$user->profile"), "->");
  assert.equal(converts("$user?->profile"), "->");
  assert.equal(converts("$user->profile->name"), "->");
  assert.equal(converts("$this"), "->");
});

test("converts class names and PHP static keywords to ::", () => {
  assert.equal(converts("User"), "::");
  assert.equal(converts("    Route"), "::");
  assert.equal(converts("{{ Auth"), "::");
  assert.equal(converts("App\\Models\\User"), "::");
  assert.equal(converts("\\App\\Models\\User"), "::");
  assert.equal(converts("self"), "::");
  assert.equal(converts("static"), "::");
  assert.equal(converts("parent"), "::");
});

test("leaves string concatenation with spaces unchanged", () => {
  assert.equal(converts("$left "), null);
  assert.equal(converts("$left ", "$left . "), null);
});

test("does not convert a dot in comments or strings", () => {
  assert.equal(converts("// $user", "// $user"), null);
  assert.equal(converts("# $user", "# $user"), null);
  assert.equal(converts("$user", "echo '$user"), null);
  assert.equal(converts("$user", "/* $user"), null);
});

test("does not convert numbers, bare identifiers, or expressions outside the first supported form", () => {
  assert.equal(converts("$pi = 3"), null);
  assert.equal(converts("strtolower"), null);
  assert.equal(converts("$users[0]"), null);
});

test("can be configured to convert when whitespace precedes the dot", () => {
  assert.equal(converts("$user ", "$user .", { onlyWithoutWhitespace: false }), "->");
});
