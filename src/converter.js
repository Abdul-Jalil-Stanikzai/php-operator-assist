// Object expressions use -> / ?->. Class names use ::. Keep matching
// conservative so concatenation, literals, and numbers remain untouched.
const objectExpression = /(?:^|[^A-Za-z0-9_$])(\$[A-Za-z_][A-Za-z0-9_]*(?:(?:->|\?->)[A-Za-z_][A-Za-z0-9_]*(?:\([^()\n]*\))?)*)$/;
const classExpression = /(?:^|[^A-Za-z0-9_$\\])((?:\\)?[A-Za-z_][A-Za-z0-9_]*(?:\\[A-Za-z_][A-Za-z0-9_]*)*)$/;
const staticKeywords = new Set(["self", "static", "parent"]);

function isPhpCodeContext(text) {
  let state = "code";
  let quote = null;
  let escaped = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (state === "line-comment") {
      if (char === "\n") state = "code";
      continue;
    }
    if (state === "block-comment") {
      if (char === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }
    if (state === "string") {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        state = "code";
        quote = null;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      state = "line-comment";
      i += 1;
    } else if (char === "#") {
      state = "line-comment";
    } else if (char === "/" && next === "*") {
      state = "block-comment";
      i += 1;
    } else if (char === "'" || char === '"') {
      state = "string";
      quote = char;
    }
  }

  return state === "code";
}

function getDotReplacement({ lineBeforeDot, textBeforeDot, onlyWithoutWhitespace = true }) {
  if (!isPhpCodeContext(textBeforeDot)) return null;
  if (onlyWithoutWhitespace && /\s$/.test(lineBeforeDot)) return null;
  const candidate = onlyWithoutWhitespace ? lineBeforeDot : lineBeforeDot.trimEnd();

  if (objectExpression.test(candidate)) return "->";

  const classMatch = candidate.match(classExpression);
  if (!classMatch) return null;
  const className = classMatch[1].split("\\").at(-1);
  if (staticKeywords.has(className.toLowerCase()) || /^[A-Z]/.test(className)) return "::";
  return null;
}

module.exports = { getDotReplacement, isPhpCodeContext };
