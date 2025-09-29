import * as vscode from "vscode";
import { VersionAndTimestampCodeLensCache } from "./provider/cache/VersionAndTimestampCodeLensCache";
import { ConfigurationLoader } from "../configuration/ConfigurationLoader";
import { CodeLensProvider } from "./provider/CodeLensProvider";
import { ReferenceCodeLensBuilder } from "./ReferenceCodeLensBuilder";


export class CodeLensProviderBuilder {
    public static getCodeLens() {
        const configurationLoader = new ConfigurationLoader();
        const builder = new ReferenceCodeLensBuilder(configurationLoader);
        return new CodeLensProvider(
            new VersionAndTimestampCodeLensCache(), builder
        );
    }
}