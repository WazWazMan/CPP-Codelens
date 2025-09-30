import * as vscode from 'vscode';
import { ReferencesCodeLens } from '../ReferenceCodeLensBuilder';
import { CodeLensResultCache } from './cache/CodeLensResultChache';
import { AsyncCommandQueue } from './AsyncCommandQueue';
import { CodeLensBuilder, executeDocumentSymbolProviderResponse } from '../CodeLensBuilder';

export class CodeLensProvider implements vscode.CodeLensProvider<ReferencesCodeLens> {
    private codeLensCache: CodeLensResultCache;
    private codeLensBuilder: CodeLensBuilder;
    private queue: AsyncCommandQueue;

    constructor(codeLensCache: CodeLensResultCache, codeLensBuilder: CodeLensBuilder) {
        this.codeLensCache = codeLensCache;
        this.codeLensBuilder = codeLensBuilder;
        this.queue = new AsyncCommandQueue();
    }
    public async provideCodeLenses(document: vscode.TextDocument, _token: vscode.CancellationToken): Promise<ReferencesCodeLens[]> {

        let codeLenses = this.codeLensCache.get(document);
        if (codeLenses !== undefined) {
            return codeLenses;
        }

        codeLenses = [];

        const topSymbols = await vscode.commands.executeCommand<executeDocumentSymbolProviderResponse[]>(
            'vscode.executeDocumentSymbolProvider',
            document.uri,
        );

        const allSymbols: (executeDocumentSymbolProviderResponse | vscode.DocumentSymbol)[] = [];

        for (const symbol of topSymbols) {
            allSymbols.push(symbol);
            allSymbols.push(...(this.getChildSymbols(symbol.children)));
        }

        for (const symbol of allSymbols) {
            const newLens = this.codeLensBuilder.build(document, symbol);
            if (newLens) {
                codeLenses.push(newLens);
            }
        }
        if (codeLenses.length === 0) {
            return [];
        }

        this.codeLensCache.set(document, codeLenses);
        return codeLenses;
    }

    public async resolveCodeLens(codeLens: ReferencesCodeLens, token: vscode.CancellationToken): Promise<ReferencesCodeLens | null> {
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
                    count: refs.length,
                    kind: codeLens.symbolKind
                };

                if (refs.length === 0) {
                    codeLens.command = {
                        title: codeLens.emptyRenderers.render(renderData),
                        command: "",
                    };

                    resolve(codeLens);
                }
                if (refs.length === 1) {
                    codeLens.command = {
                        title: codeLens.singularRenderer.render(renderData),
                        command: "editor.action.goToLocations",
                        arguments: [codeLens.uri, codeLens.range.start, refs]
                    };
                    resolve(codeLens);
                }
                else {
                    codeLens.command = {
                        title: codeLens.pluralRenderer.render(renderData),
                        command: "editor.action.peekLocations",
                        arguments: [codeLens.uri, codeLens.range.start, refs]
                    };
                    resolve(codeLens);
                }
            });

        });
        return null;
    }

    private getChildSymbols(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
        const allSymbols: vscode.DocumentSymbol[] = [];

        for (const symbol of symbols) {
            allSymbols.push(symbol);
            if (symbol.children) {
                allSymbols.push(...this.getChildSymbols(symbol.children));
            }
        }

        return allSymbols;
    }
}