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
    emptyTemplate: string;
    singularTemplate: string;
    pluralTemplate: string;
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
        const defaultString = "{{ count }} references";
        const config = vscode.workspace.getConfiguration("cpp-codelens");
        this.configuration = {
            enableCodeLens: config.get("codelens.enableCodeLens", true),
            emptyTemplate: config.get(`codelens.references.emptyTemplate`, ""),
            singularTemplate: config.get(`codelens.references.singularTemplate`, defaultString),
            pluralTemplate: config.get(`codelens.references.pluralTemplate`, defaultString),
            references: {}
        };
        for (let index = 0; index < symbolTypes.length; index++) {
            const symbol = symbolTypes[index];
            const path = `codelens.references.${symbol}`;
            this.configuration.references[symbol] = {
                enableCodeLens: config.get(`${path}.enableCodeLens`, true),
                emptyTemplate: config.get(`${path}.emptyTemplate`, ""),
                singularTemplate: config.get(`${path}.singularTemplate`, defaultString),
                pluralTemplate: config.get(`${path}.pluralTemplate`, defaultString),
                isEmptyTemplateDefault: config.get(`${path}.emptyTemplate`, "") == "",
                isSingularTemplate: config.get(`${path}.singularTemplate`, defaultString) == defaultString,
                isPluralTemplate: config.get(`${path}.pluralTemplate`, defaultString) == defaultString,
            };
        }
    }

}