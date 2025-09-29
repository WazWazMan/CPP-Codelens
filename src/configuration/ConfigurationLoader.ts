import * as vscode from "vscode";

export const symbolTypes = [
    "file",
    "module",
    "namespace",
    "package",
    "class",
    "metod",
    "property",
    "field",
    "constructor",
    "enum",
    "interface",
    "function",
    "variable",
    "constant",
    "enumMember",
    "struct",
    "operator"
];

export interface Configuration {
    enableCodeLens: boolean;
    referencesTemplate: string;
    references: {
        [key in typeof symbolTypes[number]]: {
            enableCodeLens: boolean;
            emptyTemplate: string;
            singularTemplate: string;
            pluralTemplate: string;
            isEmptyTemplateDefault: boolean
            isSingularTemplate: boolean
            isPluralTemplate: boolean
        }
    }
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
            references: {
            }
        };
        const defaultString = "{{ count }} references";
        for (let index = 0; index < symbolTypes.length; index++) {
            const symbol = symbolTypes[index];
            const path = `codelens.references.${symbol}`;
            this.configuration.references[symbol] = {
                enableCodeLens: config.get(`${path}.enableCodeLens`, true),
                emptyTemplate: config.get(`${path}.emptyTemplate`, defaultString),
                singularTemplate: config.get(`${path}.singularTemplate`, defaultString),
                pluralTemplate: config.get(`${path}.pluralTemplate`, defaultString),
                isEmptyTemplateDefault: this.configuration.references[symbol].emptyTemplate === defaultString,
                isSingularTemplate: this.configuration.references[symbol].singularTemplate === defaultString,
                isPluralTemplate: this.configuration.references[symbol].pluralTemplate === "",
            };
        }
    }

}