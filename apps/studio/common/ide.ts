import type { TemplateNode } from '@analogia/models/element';
import { IdeType } from '@analogia/models/ide';
import type { Icons } from '@analogia/ui/icons';

export class IDE {
    static readonly VS_CODE = new IDE('VSCode', IdeType.VS_CODE, 'vscode', 'VSCodeLogo');
    static readonly CURSOR = new IDE('Cursor', IdeType.CURSOR, 'cursor', 'CursorLogo');
    static readonly ZED = new IDE('Zed', IdeType.ZED, 'zed', 'ZedLogo');
    static readonly WINDSURF = new IDE('Windsurf', IdeType.WINDSURF, 'windsurf', 'WindsurfLogo');
    static readonly TRAE = new IDE('Trae', IdeType.TRAE, 'trae', 'TraeLogo');

    private constructor(
        public readonly displayName: string,
        public readonly type: IdeType,
        public readonly command: string,
        public readonly icon: keyof typeof Icons,
    ) {}

    toString() {
        return this.displayName;
    }

    static fromType(type: IdeType): IDE {
        switch (type) {
            case IdeType.VS_CODE:
                return IDE.VS_CODE;
            case IdeType.CURSOR:
                return IDE.CURSOR;
            case IdeType.ZED:
                return IDE.ZED;
            case IdeType.WINDSURF:
                return IDE.WINDSURF;
            case IdeType.TRAE:
                return IDE.TRAE;
            default:
                throw new Error(`Unknown IDE type: ${type}`);
        }
    }

    static getAll(): IDE[] {
        return [this.VS_CODE, this.CURSOR, this.ZED, this.WINDSURF, this.TRAE];
    }

    getCodeCommand(templateNode: TemplateNode) {
        const filePath = templateNode.path;
        const startTag = templateNode.startTag;
        const endTag = templateNode.endTag || startTag;
        let codeCommand = `${this.command}://file/${filePath}`;

        if (startTag && endTag) {
            const startRow = startTag.start.line;
            const startColumn = startTag.start.column;
            const endRow = endTag.end.line;
            const endColumn = endTag.end.column - 1;
            codeCommand += `:${startRow}:${startColumn}`;
            // Note: Zed API doesn't seem to handle end row/column (ref: https://github.com/zed-industries/zed/issues/18520)
            if (this.type !== IdeType.ZED) {
                codeCommand += `:${endRow}:${endColumn}`;
            }
        }
        return codeCommand;
    }

    getCodeFileCommand(filePath: string, line?: number) {
        let command = `${this.command}://file/${filePath}`;
        if (line) {
            command += `:${line}`;
        }
        return command;
    }
}
