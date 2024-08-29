const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log('Congratulations, your extension "django-register-tags" is now active!');

    const boilerPlate = (word) => `
@admin.register(${word})
class ${word}Admin(admin.ModelAdmin):
    class Meta:
        model = ${word}
        fields = '__all__'
`;

    const modelsBoilerPlate = (className) => `
@admin.register(${className})
class ${className}Admin(admin.ModelAdmin):
    class Meta:
        model = ${className}
`;

    const listDisplay = (name, fields) => `
@admin.register(${name})
class ${name}Admin(admin.ModelAdmin):
    list_display = (${fields.map(field => `"${field}"`).join(', ')})
`;

    const isAdminFile = () => {
        const currentFilePath = vscode.window.activeTextEditor.document.fileName.split('/').pop();
        return currentFilePath === "admin.py";
    };

    const hasModelsImports = (fileText) => fileText.includes('from .models import');

    const registerModel = vscode.commands.registerCommand('django-register-tags.registerModel', () => {
        const editor = vscode.window.activeTextEditor;
        const selection = editor.selection;
        const word = editor.document.getText(selection);

        if (isAdminFile() && word) {
            // Validate model name (must start with a capital letter)
            if (word.charAt(0).toUpperCase() === word.charAt(0)) {
                const lineCount = editor.document.lineCount;
                const position = new vscode.Position(lineCount, 0);

                editor.edit(editBuilder => {
                    editBuilder.insert(position, boilerPlate(word));
                });
            } else {
                vscode.window.showWarningMessage("Model name should start with a capital letter.");
            }
        }
    });

    const registerModels = vscode.commands.registerCommand('django-register-tags.registerModels', () => {
        const editor = vscode.window.activeTextEditor;
        const fileText = editor.document.getText();

        if (isAdminFile() && hasModelsImports(fileText)) {
            let codeToInject = "";
            fileText.splitLines().forEach(line => {
                if (line.includes('.models')) {
                    const models = line.split('import')[1].trim().split(/\s*,\s*/);
                    models.forEach(model => {
                        codeToInject += boilerPlate(model);
                    });

                    const lineCount = editor.document.lineCount;
                    const position = new vscode.Position(lineCount, 0);
                    editor.edit(editBuilder => {
                        editBuilder.insert(position, codeToInject);
                    });
                }
            });
        }
    });

    const registerModelByField = vscode.commands.registerCommand('django-register-tags.registerModelByField', () => {
        const editor = vscode.window.activeTextEditor;
        const currentFilePath = editor.document.fileName;
        const modelsFilePath = currentFilePath.replace('admin', 'models');
        const selectedClassName = editor.document.getText(editor.selection);
        const openPath = vscode.Uri.file(modelsFilePath);

        vscode.workspace.openTextDocument(openPath).then(document => {
            const textLines = document.getText().split('\n');
            let className = null;
            let properties = [];

            textLines.forEach(line => {
                if (line.startsWith('class ')) {
                    className = line.split(' ')[1].split('(')[0];
                } else if (className === selectedClassName && line.includes('=')) {
                    const property = line.split('=')[0].trim();
                    properties.push(property);
                }
            });

            if (className === selectedClassName && properties.length > 0) {
                const codeToInject = listDisplay(className, properties);
                const lineCount = editor.document.lineCount;
                const position = new vscode.Position(lineCount, 0);

                editor.edit(editBuilder => {
                    editBuilder.insert(position, codeToInject);
                });
            }
        });
    });

    context.subscriptions.push(registerModel, registerModels, registerModelByField);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
