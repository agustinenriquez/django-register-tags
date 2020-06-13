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

	let boilerPlate = function(word) {
		// i know this looks awful but it seems to be the way VSCODE recognizes
		// the position to inject the string.
		return `

@admin.register(${word})
class ${word}Admin(admin.ModelAdmin):
	class Meta:
	    model = ${word}
	    fields = '__all__'\n`;
}

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
				// Add validation for model names (ie: first letter must be capitalized.)
				var lineCount = editor.document.lineCount;
				var position = new vscode.Position(lineCount, 0)
				editor.edit(editBuilder => {
					editBuilder.insert(position, boilerPlate(word))
				});
			}
		}

		vscode.window.showInformationMessage(boilerPlate);
	});

	let registerModels = vscode.commands.registerCommand('django-register-tags.registerModels', function () {
		// The code you place here will be executed every time your command is executed
		var editor = vscode.window.activeTextEditor;
		var fileText = editor.document.getText();
		var currentFilePath = vscode.window.activeTextEditor.document.fileName;
		currentFilePath = currentFilePath.split('/') 
		var isAdminFile = currentFilePath[currentFilePath.length-1]
		var codeToInject = "";
		var modelString
		if (isAdminFile == "admin.py") {
			if (fileText.indexOf('from .models import') > 0) {
				fileText.splitLines().forEach((e) => {
					if (e.indexOf('.models') > 0) {
						var indexOfImport = e.indexOf('import') + 7;
						modelString = e.substring(indexOfImport, e.length);
						modelString = modelString.replace(/,+/g, '').split(' ');
						modelString.forEach((model) => {
							codeToInject += boilerPlate(model)
						});
						var lineCount = editor.document.lineCount;
						var position = new vscode.Position(lineCount, 0)
						editor.edit(editBuilder => {
							editBuilder.insert(position, codeToInject)
						});
					};
				});
			}
		}
		vscode.window.showInformationMessage(boilerPlate);
	});

	context.subscriptions.push(registerModels);

}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
