import * as vscode from 'vscode';
import { CodeLensProviderBuilder } from './codelens/CodeLensProviderBuilder';

export function activate(context: vscode.ExtensionContext) {
    
    const codelensProvider =    CodeLensProviderBuilder.getCodeLens();
    vscode.languages.registerCodeLensProvider("*", codelensProvider);
}

export function deactivate() { }
