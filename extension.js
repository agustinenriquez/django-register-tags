// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const path = require("path");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "django-register-tags" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json

	let registerModel = vscode.commands.registerCommand('django-register-tags.registerModel', function () {
		// The code you place here will be executed every time your command is executed
		var editor = vscode.window.activeTextEditor;
		var selection = editor.selection;
		var word = editor.document.getText(selection);
		var currentFilePath = vscode.window.activeTextEditor.document.fileName;
		currentFilePath = currentFilePath.split('/') 
		var isAdminFile = currentFilePath[currentFilePath.length-1]
		if (isAdminFile == "admin.py") {
			if (word) {
				var lineCount = editor.document.lineCount;
				var position = new vscode.Position(lineCount, 0)
				const lines = `\n\n`
				const decorator = `@admin.register(${word})\n`;
				const classSign = `class ${word}Admin(admin.ModelAdmin):\n`;
				const metaClass = `    class Meta:\n`;
				const modelWord = `        model = ${word}\n`;
				const fields = `        fields = '__all__'\n`;
				const boilerPlate = lines + decorator + classSign + metaClass + modelWord + fields
				// Add validation for model names (ie: first letter must be capitalized.)
				editor.edit(editBuilder => {
					editBuilder.insert(position, boilerPlate)
				});
			}
		}

		vscode.window.showInformationMessage(boilerPlate);
	});

	context.subscriptions.push(registerModel);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
