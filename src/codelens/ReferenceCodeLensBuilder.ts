import * as vscode from 'vscode';
import { Renderable } from '../renderer/Renderable';
import { TemplateRenderer } from '../renderer/TemplateRenderer';
import { Configuration, ConfigurationLoader, SymbolType, symbolTypes } from '../configuration/ConfigurationLoader';
import { executeDocumentSymbolProviderResponse } from './CodeLensBuilder';

export class ReferencesCodeLens extends vscode.CodeLens {
    constructor(
        public uri: vscode.Uri,
        range: vscode.Range,
        public symbolKind: number,
        public emptyRenderers: Renderable,
        public singularRenderer: Renderable,
        public pluralRenderer: Renderable
    ) {
        super(range);
    }
}

export class ReferenceCodeLensBuilder {
    private config: Configuration;
    private emptyRenderersMap: Map<string, Renderable>;
    private singularRenderersMap: Map<string, Renderable>;
    private pluralRenderersMap: Map<string, Renderable>;
    constructor(configurationLoader: ConfigurationLoader) {
        this.config = configurationLoader.getConfiguration();
        this.emptyRenderersMap = new Map();
        this.singularRenderersMap = new Map();
        this.pluralRenderersMap = new Map();
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

    public build(document: vscode.TextDocument, symbol: executeDocumentSymbolProviderResponse | vscode.DocumentSymbol): ReferencesCodeLens | null {
        const symbolType = vscode.SymbolKind[symbol.kind].toLocaleLowerCase();

        // check if codelens is enabled on this type of symbol
        if (symbolTypes.includes(symbolType as SymbolType) && !this.config.references[symbolType].enableCodeLens) {
            return null;
        }

        const emptyRenderers = this.getEmprtRenderer(symbolType);
        const singularRenderer = this.getSingularRenderer(symbolType);
        const pluralRenderer = this.getPluralRenderer(symbolType);
        return new ReferencesCodeLens(
            document.uri,
            symbol.selectionRange,
            symbol.kind,
            emptyRenderers,
            singularRenderer,
            pluralRenderer);
    }


}


