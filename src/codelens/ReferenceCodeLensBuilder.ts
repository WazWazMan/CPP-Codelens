import * as vscode from 'vscode';
import { ReferencesCodeLens } from './provider/CodeLensProvider';
import { Configuration, ConfigurationLoader, SymbolType, symbolTypes } from '../configuration/ConfigurationLoader';
import { ref } from 'process';
import { Renderable } from '../renderer/Renderable';
import { TemplateRenderer } from '../renderer/TemplateRenderer';
import { AsyncCommandQueue } from './provider/AsyncCommandQueue';
import { CodeLensBuilder } from './CodeLensBuilder';

export class ReferenceCodeLensBuilder implements CodeLensBuilder {
    private config: Configuration;
    private emptyRenderersMap: Map<string, Renderable>;
    private singularRenderersMap: Map<string, Renderable>;
    private pluralRenderersMap: Map<string, Renderable>;
    private queue: AsyncCommandQueue;
    constructor(configurationLoader: ConfigurationLoader) {
        this.config = configurationLoader.getConfiguration();
        this.emptyRenderersMap = new Map();
        this.singularRenderersMap = new Map();
        this.pluralRenderersMap = new Map();
        this.queue = new AsyncCommandQueue();
    }

    private getEmprtRenderer(symbolType: SymbolType): Renderable {
        let renderer = this.emptyRenderersMap.get(symbolType);
        if (renderer) {
            return renderer;
        }

        let template;
        if (symbolTypes.includes(symbolType as SymbolType)) {
            template = this.config.references[symbolType].isEmptyTemplateDefault ? this.config.emptyTemplate : this.config.references[symbolType].emptyTemplate;
        } else {
            template = this.config.emptyTemplate;
        }

        renderer = new TemplateRenderer(template);
        this.emptyRenderersMap.set(symbolType, renderer);

        return renderer;
    }

    private getSingularRenderer(symbolType: SymbolType): Renderable {
        let renderer = this.singularRenderersMap.get(symbolType);
        if (renderer) {
            return renderer;
        }

        let template;
        if (symbolTypes.includes(symbolType as SymbolType)) {
            template = this.config.references[symbolType].isSingularTemplate ? this.config.singularTemplate : this.config.references[symbolType].singularTemplate;
        } else {
            template = this.config.singularTemplate;
        }

        renderer = new TemplateRenderer(template);
        this.singularRenderersMap.set(symbolType, renderer);

        return renderer;
    }

    private getPluralRenderer(symbolType: SymbolType): Renderable {
        let renderer = this.pluralRenderersMap.get(symbolType);
        if (renderer) {
            return renderer;
        }

        let template;
        if (symbolTypes.includes(symbolType as SymbolType)) {
            template = this.config.references[symbolType].isPluralTemplate ? this.config.pluralTemplate : this.config.references[symbolType].pluralTemplate;
        } else {
            template = this.config.pluralTemplate;
        }

        renderer = new TemplateRenderer(template);
        this.pluralRenderersMap.set(symbolType, renderer);

        return renderer;
    }

    public async build(codeLens: ReferencesCodeLens, token: vscode.CancellationToken): Promise<ReferencesCodeLens | null> {
        return new Promise((resolve) => {
            this.queue.enqueue(async () => {
                const symbolType = vscode.SymbolKind[codeLens.symbolKind].toLocaleLowerCase();

                const position = codeLens.range.start;

                let refs: vscode.Location[] = await vscode.commands.executeCommand<vscode.Location[]>(
                    "vscode.executeReferenceProvider",
                    codeLens.uri,
                    position);

                // filter out self-references in CodeLens reference count
                refs = refs.filter((item) => {
                    return !(item.range.start.character === position.character && item.range.start.line === position.line);
                });


                let renderData = {
                    count: refs.length
                };

                if (refs.length === 0) {
                    const title = this.getEmprtRenderer(symbolType).render(renderData);

                    if (title === '') {
                        return resolve(null);
                    }

                    codeLens.command = {
                        title: title,
                        command: "",
                    };

                    resolve(codeLens);
                }
                if (refs.length === 1) {
                    codeLens.command = {
                        title: this.getSingularRenderer(symbolType).render(renderData),
                        command: "editor.action.goToLocations",
                        arguments: [codeLens.uri, codeLens.range.start, refs]
                    };
                    resolve(codeLens);
                }
                else {
                    codeLens.command = {
                        title: this.getPluralRenderer(symbolType).render(renderData),
                        command: "editor.action.peekLocations",
                        arguments: [codeLens.uri, codeLens.range.start, refs]
                    };
                    resolve(codeLens);
                }
            });

        });
    }
}