import * as vscode from 'vscode';
import { ReferencesCodeLens } from '../CodeLensProvider';

export interface CodeLensResultCache {
  get(document: vscode.TextDocument): ReferencesCodeLens[] | undefined;
  set(document: vscode.TextDocument, codeLenses: ReferencesCodeLens[]): void;
}
