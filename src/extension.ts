import * as vscode from 'vscode';
import { CodeLensProvider } from './codelens/provider/CodeLensProvider';

export function activate(context: vscode.ExtensionContext) {
    const codelensProvider = new CodeLensProvider();
    vscode.languages.registerCodeLensProvider("*", codelensProvider);

}

export function deactivate() { }
