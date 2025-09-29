import * as vscode from "vscode";

export interface Configuration {
    enableCodeLens: boolean;
    referencesTemplate: string;
}

export class ConfigurationLoader {
    private configuration!: Configuration;

    constructor() {
        this.loadConfiguration();
    }

    public updateConfiguration() {
        this.loadConfiguration();
    }

    public getConfiguration(): Configuration {
        return this.configuration;
    }

    private loadConfiguration() {
        const config = vscode.workspace.getConfiguration("cpp-codelens");
        this.configuration = {
            enableCodeLens: config.get("codelens.enableCodeLens", true),
            referencesTemplate: config.get("codelens.references.template", "{{ count }} references"),
        };
    }

}