import * as vscode from "vscode";
import { ReferencesCodeLens } from "./ReferenceCodeLensBuilder";

export type executeDocumentSymbolProviderResponse = vscode.SymbolInformation & vscode.DocumentSymbol;

export interface CodeLensBuilder {
    build(document: vscode.TextDocument, symbol: executeDocumentSymbolProviderResponse | vscode.DocumentSymbol): ReferencesCodeLens | null
}