import * as vscode from "vscode";
import axios from "axios";

export function activate(context: vscode.ExtensionContext) {
  
  
  const iconPath = vscode.Uri.file(context.asAbsolutePath("icon-abdel.png"));
  vscode.window.showInformationMessage("Hello");

  let disposable = vscode.commands.registerCommand(
    "extension.generateCode",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage("No active editor");
        return;
      }

      const document = editor.document;
      const selection = editor.selection;
      const position = selection.active;

      // Get the 20 lines before the cursor
      const startLine = Math.max(0, position.line - 20);
      const range = new vscode.Range(
        startLine,
        0,
        position.line,
        position.character
      );
      const text = document.getText(range);

      // Prepare the prompt
      const prompt = `Complete the following code while maintaining the existing style and logic. If it's Python, ensure PEP 8 compliance:\n\n${text}\n`;
      try {
        const apiKey = await vscode.window.showInputBox({
          prompt: "Enter your OpenAI API key",
        });
        if (!apiKey) {
          vscode.window.showErrorMessage("API key is required");
          return;
        }

        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
          }
        );

        const generatedCode = response.data.choices[0].message.content.trim();
        editor.edit((editBuilder) => {
          editBuilder.insert(position, generatedCode);
        });
        vscode.window.showInformationMessage("Succes insert code");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        vscode.window.showErrorMessage(
          "Error generating code: " + errorMessage
        );
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
