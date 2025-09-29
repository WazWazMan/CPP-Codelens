import * as vscode from 'vscode';
import { CodeLensResultCache } from './cache/CodeLensResultChache';
import { CodeLensBuilder } from '../CodeLensBuilder';

type executeDocumentSymbolProviderResponse = vscode.SymbolInformation & vscode.DocumentSymbol;

export class ReferencesCodeLens extends vscode.CodeLens {
    constructor(
        public uri: vscode.Uri,
        range: vscode.Range,
        public symbolKind: number,
    ) {
        super(range);
    }
}



export class CodeLensProvider implements vscode.CodeLensProvider<ReferencesCodeLens> {
    private codeLensCache: CodeLensResultCache;
    public codeLensBuilder: CodeLensBuilder;

    constructor(codeLensCache: CodeLensResultCache, codeLensBuilder: CodeLensBuilder) {
        this.codeLensCache = codeLensCache;
        this.codeLensBuilder = codeLensBuilder;
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
            codeLenses.push(new ReferencesCodeLens(document.uri, symbol.selectionRange, symbol.kind));
        }
        if (codeLenses.length === 0) {
            return [];
        }

        this.codeLensCache.set(document, codeLenses);
        return codeLenses;
    }

    public async resolveCodeLens(codeLens: ReferencesCodeLens, token: vscode.CancellationToken): Promise<ReferencesCodeLens | null> {
        if (vscode.workspace.getConfiguration("cpp-codelens").get("enableCodeLens", true)) {
            return this.codeLensBuilder.build(codeLens, token);
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