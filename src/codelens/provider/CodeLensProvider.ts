import * as vscode from 'vscode';
import { AsyncCommandQueue } from './AsyncCommandQueue';
import { CodeLensResultCache } from './cache/CodeLensResultChache';
import { VersionAndTimestampCodeLensCache } from './cache/VersionAndTimestampCodeLensCache';
import { Renderable } from '../../renderer/Renderable';
import { TemplateRenderer } from '../../TemplateRenderer';

type executeDocumentSymbolProviderResponse = vscode.SymbolInformation & vscode.DocumentSymbol;

export class ReferencesCodeLens extends vscode.CodeLens {
    constructor(
        public uri: vscode.Uri,
        range: vscode.Range
    ) {
        super(range);
    }
}



export class CodeLensProvider implements vscode.CodeLensProvider<ReferencesCodeLens> {
    private queue: AsyncCommandQueue;
    private codeLensCache: CodeLensResultCache;
    private renderer: Renderable;

    constructor(codeLensCache: CodeLensResultCache, renderer: Renderable) {
        this.queue = new AsyncCommandQueue();
        this.codeLensCache = codeLensCache;
        this.renderer = renderer;
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
            codeLenses.push(new ReferencesCodeLens(document.uri, symbol.selectionRange));
            console.log(`${symbol.name} ,: ${symbol.kind}`);
        }
        if (codeLenses.length === 0) {
            return [];
        }

        this.codeLensCache.set(document, codeLenses);
        return codeLenses;
    }

    public async resolveCodeLens(codeLens: ReferencesCodeLens, token: vscode.CancellationToken): Promise<ReferencesCodeLens | null> {
        if (vscode.workspace.getConfiguration("cpp-codelens").get("enableCodeLens", true)) {
            return new Promise((resolve) => {
                this.queue.enqueue(async () => {
                    const document = await vscode.workspace.openTextDocument(codeLens.uri);
                    const position = codeLens.range.start;

                    let refs: vscode.Location[] = await vscode.commands.executeCommand<vscode.Location[]>(
                        "vscode.executeReferenceProvider",
                        codeLens.uri,
                        position);

                    // filter out self-references in CodeLens reference count
                    refs = refs.filter((item) => {
                        return !(item.range.start.character === position.character && item.range.start.line === position.line);
                    });

                    if (refs.length === 1) {
                        codeLens.command = {
                            title: this.renderer.render({ count: refs.length }),
                            tooltip: "Tooltip provided by sample extension",
                            command: "editor.action.goToLocations",
                            arguments: [codeLens.uri, codeLens.range.start, refs]
                        };
                    }
                    else {
                        codeLens.command = {
                            title: this.renderer.render({ count: refs.length }),
                            tooltip: "Tooltip provided by sample extension",
                            command: "editor.action.peekLocations",
                            arguments: [codeLens.uri, codeLens.range.start, refs]
                        };
                    }
                    resolve(codeLens);

                });

            });
        }

        return null;
    }

    private getChildSymbols(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
        const allSymbols: vscode.DocumentSymbol[] = [];

        for (const symbol of symbols) {
            allSymbols.push(symbol);
            if (symbol.children) {
                allSymbols.concat(this.getChildSymbols(symbol.children));
            }
        }

        return allSymbols;
    }
}