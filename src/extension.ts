import * as vscode from 'vscode';
import { CodeLensProvider } from './codelens/provider/CodeLensProvider';
import { CodeLensBuilder } from './codelens/CodeLensBuilder';

export function activate(context: vscode.ExtensionContext) {
    
    const codelensProvider = CodeLensBuilder.getCodeLens();
    vscode.languages.registerCodeLensProvider("*", codelensProvider);

}

export function deactivate() { }
