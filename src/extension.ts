import * as vscode from 'vscode';
import { CodeLensProviderBuilder } from './codelens/CodeLensProviderBuilder';
import { ConfigurationLoader } from './configuration/ConfigurationLoader';

export function activate(context: vscode.ExtensionContext) {

    const configurationLoader = new ConfigurationLoader();
    const codelensProvider = CodeLensProviderBuilder.getCodeLens();
    let codeLensProviderDisposable = vscode.languages.registerCodeLensProvider("*", codelensProvider);

    const configChangeListener = vscode.workspace.onDidChangeConfiguration((event: vscode.ConfigurationChangeEvent) => {
        if (!event.affectsConfiguration('cpp-codelens')) {
            return;
        }

        configurationLoader.updateConfiguration();
        codeLensProviderDisposable.dispose();

        const codelensProvider = CodeLensProviderBuilder.getCodeLens();
        codeLensProviderDisposable = vscode.languages.registerCodeLensProvider("*", codelensProvider);

        context.subscriptions.push(codeLensProviderDisposable);
    });

    context.subscriptions.push(codeLensProviderDisposable, configChangeListener);

}

export function deactivate() { }
