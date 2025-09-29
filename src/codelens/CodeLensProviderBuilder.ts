import * as vscode from "vscode";
import { CodeLensProvider } from "./provider/CodeLensProvider";
import { VersionAndTimestampCodeLensCache } from "./provider/cache/VersionAndTimestampCodeLensCache";
import { ReferenceCodeLensBuilder } from "./ReferenceCodeLensBuilder";
import { ConfigurationLoader } from "../configuration/ConfigurationLoader";


export class CodeLensProviderBuilder {
    public static getCodeLens() {
        const configurationLoader = new ConfigurationLoader();
        const builder = new ReferenceCodeLensBuilder(configurationLoader);
        return new CodeLensProvider(
            new VersionAndTimestampCodeLensCache(),
            builder
        );
    }
}