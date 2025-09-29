import { Renderable } from "./renderer/Renderable";

export class TemplateRenderer implements Renderable {
    private readonly parts: ReadonlyArray<string>;
    constructor(template: string) {
        this.parts = template.split(/({{\s*\w+\s*}})/g).filter((part) => part !== "");
    }

    public render(data: Record<string, string | number>) {
        const resParts: (string | number)[] = [];

        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i];
            if (!part.startsWith('{{') || !part.endsWith('}}')) {
                resParts.push(part);
                continue;
            }

            const key = part.slice(2, -2).trim();
            if (key in data) {
                resParts.push(data[key]);
                continue;
            }

            resParts.push('');

        }

        return resParts.join('');
    }
}