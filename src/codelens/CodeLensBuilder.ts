import * as vscode from "vscode";
import { ReferencesCodeLens } from "./provider/CodeLensProvider";

export interface CodeLensBuilder {
    build(codeLens: ReferencesCodeLens, token: vscode.CancellationToken): Promise<ReferencesCodeLens | null>
}
