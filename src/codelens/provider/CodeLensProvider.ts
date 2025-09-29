import * as vscode from 'vscode';

class CodeLensProvider implements vscode.CodeLensProvider {
    constructor() {
    }
    public async provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken) {
    }

    public async resolveCodeLens(codeLens: vscode.CodeLensProvider, token: vscode.CancellationToken) {
    }
}