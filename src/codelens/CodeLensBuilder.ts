import * as vscode from "vscode"
import { TemplateRenderer } from "../TemplateRenderer";
import { VersionAndTimestampCodeLensCache } from "./provider/cache/VersionAndTimestampCodeLensCache";
import { CodeLensProvider } from "./provider/CodeLensProvider";
import { ConfigurationLoader } from "../configuration/ConfigurationLoader";

export class CodeLensBuilder {
    public static getCodeLens() {

        const configuration = (new ConfigurationLoader()).getConfiguration();
        return new CodeLensProvider(
            new VersionAndTimestampCodeLensCache(),
            new TemplateRenderer(configuration.referencesTemplate));
    }
}