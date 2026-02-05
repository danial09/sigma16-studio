export const editor = {
    create: () => ({
        dispose: () => {},
        getValue: () => '',
        setValue: () => {},
        getModel: () => null,
        onDidChangeModelContent: () => ({ dispose: () => {} }),
        onDidChangeCursorPosition: () => ({ dispose: () => {} }),
        onMouseMove: () => ({ dispose: () => {} }),
        onMouseLeave: () => ({ dispose: () => {} }),
        deltaDecorations: () => [],
        updateOptions: () => {},
    }),
    defineTheme: () => {},
    setTheme: () => {},
    OverviewRulerLane: { Full: 7 },
};

export const languages = {
    register: () => {},
    setMonarchTokensProvider: () => {},
};

export class Range {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;

    constructor(startLine: number, startCol: number, endLine: number, endCol: number) {
        this.startLineNumber = startLine;
        this.startColumn = startCol;
        this.endLineNumber = endLine;
        this.endColumn = endCol;
    }
}
