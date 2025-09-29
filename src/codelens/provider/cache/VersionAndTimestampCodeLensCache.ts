import * as vscode from 'vscode';
import { CodeLens, TextDocument } from 'vscode';
import { CodeLensResultCache } from './CodeLensResultChache';
import { ReferencesCodeLens } from '../CodeLensProvider';


type CacheInformation = { version: number; codeLens: ReferencesCodeLens[]; lastUpdated: Date };

export class VersionAndTimestampCodeLensCache implements CodeLensResultCache {
  private cacheByFsPath: Map<string, CacheInformation> = new Map();
  private globalLastUpdated: Date = new Date();

  public get(document: TextDocument): ReferencesCodeLens[] | undefined {
    const cache = this.cacheByFsPath.get(document.uri.fsPath);
    if (cache === undefined) {
      return undefined;
    }

    const currentVersion = document.version;
    const isInitialVersion = currentVersion === 1;

    const isDocumentUpdate = cache.version !== currentVersion && !isInitialVersion;
    if (isDocumentUpdate) {
      this.globalLastUpdated = new Date();
    }

    const isCacheValid = cache.version === currentVersion && cache.lastUpdated > this.globalLastUpdated;
    if (isCacheValid) {
      return cache.codeLens;
    }

    return undefined;
  }

  public set(document: TextDocument, codeLenses: ReferencesCodeLens[]): void {
    this.cacheByFsPath.set(document.uri.fsPath, {
      version: document.version,
      codeLens: codeLenses,
      lastUpdated: new Date(),
    });
  }
}
