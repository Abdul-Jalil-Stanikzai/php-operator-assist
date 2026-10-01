const vscode = require("vscode");
const { getDotReplacement } = require("./converter");

function activate(context) {
  let replacing = false;

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(async (event) => {
      // Laravel Blade files are commonly identified as `blade` rather than
      // `php`, even though they contain PHP expressions such as `$user`.
      if (replacing || !["php", "blade"].includes(event.document.languageId)) return;

      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.uri.toString() !== event.document.uri.toString()) return;
      if (!vscode.workspace.getConfiguration("phpDotToArrow", event.document.uri).get("enabled", true)) return;

      for (const change of event.contentChanges) {
        if (change.text !== "." || !change.range.isEmpty) continue;
        const position = change.range.start;
        const line = event.document.lineAt(position.line).text;
        const lineBeforeDot = line.slice(0, position.character);
        const textBeforeDot = event.document.getText(new vscode.Range(new vscode.Position(0, 0), position));
        const onlyWithoutWhitespace = vscode.workspace
          .getConfiguration("phpDotToArrow", event.document.uri)
          .get("onlyWithoutWhitespace", true);

        const replacement = getDotReplacement({ lineBeforeDot, textBeforeDot, onlyWithoutWhitespace });
        if (!replacement) continue;

        replacing = true;
        try {
          await editor.edit((builder) => {
            builder.replace(new vscode.Range(position, position.translate(0, 1)), replacement);
          }, { undoStopBefore: false, undoStopAfter: false });
        } finally {
          replacing = false;
        }
      }
    })
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
