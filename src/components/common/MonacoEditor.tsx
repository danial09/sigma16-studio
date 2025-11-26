import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useCompiler } from '@/contexts/CompilerContext';
import { HighlightRange, LineHighlight } from '@/types/compiler.types';

interface MonacoEditorProps {
    value: string;
    onChange?: (value: string) => void;
    language: string;
    theme?: string;
    readOnly?: boolean;
    onCursorChange?: (line: number, column: number) => void;
    onCompile?: () => void;
    lineHighlights?: LineHighlight[];
    rangeHighlights?: HighlightRange[];
    onMouseMove?: (line: number, column: number) => void;
    onMouseLeave?: () => void;
    className?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
    value,
    onChange,
    language,
    theme,
    readOnly = false,
    onCursorChange,
    lineHighlights = [],
    rangeHighlights = [],
    onMouseMove,
    onMouseLeave,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const decorationsRef = useRef<string[]>([]);
    const { settings } = useCompiler();

    const editorTheme = React.useMemo(() => {
        return settings.theme === 'light' ? 'vs' : 'vs-dark';
    }, [theme, settings.theme]);

    useEffect(() => {
        if (!containerRef.current) return;

        const editor = monaco.editor.create(containerRef.current, {
            value,
            language,
            theme: editorTheme,
            readOnly,
            fontSize: settings.fontSize,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            wordWrap: 'off',


        });

        editorRef.current = editor;

        const disposables: monaco.IDisposable[] = [];

        if (onChange) {
            disposables.push(
                editor.onDidChangeModelContent(() => {
                    onChange(editor.getValue());
                }),
            );
        }

        if (onCursorChange) {
            disposables.push(
                editor.onDidChangeCursorPosition((e) => {
                    onCursorChange(e.position.lineNumber - 1, e.position.column - 1);
                }),
            );
        }

        if (onMouseMove) {
            disposables.push(
                editor.onMouseMove((e) => {
                    const pos = e.target.position;
                    if (!pos) return;
                    onMouseMove(pos.lineNumber - 1, pos.column - 1);
                }),
            );
        }

        if (onMouseLeave) {
            disposables.push(
                editor.onMouseLeave(() => {
                    onMouseLeave();
                }),
            );
        }

        return () => {
            disposables.forEach((d) => d.dispose());
            editor.dispose();
        };
    }, [language, theme, editorTheme, readOnly, settings.fontSize, onChange, onCursorChange, onMouseMove, onMouseLeave]);

    useEffect(() => {
        if (!editorRef.current) return;
        const model = editorRef.current.getModel();
        if (!model) return;

        const decorations: monaco.editor.IModelDeltaDecoration[] = [];

        for (const highlight of lineHighlights) {
            decorations.push({
                range: new monaco.Range(highlight.line + 1, 1, highlight.line + 1, 1),
                options: {
                    isWholeLine: true,
                    className: highlight.type === 'statement' ? 'highlight-stmt' : 'highlight-block',
                    overviewRuler: {
                        color: highlight.type === 'statement' ? '#47d35c' : '#4ea3ff',
                        position: monaco.editor.OverviewRulerLane.Full,
                    },
                },
            });
        }

        for (const rangeHighlight of rangeHighlights) {
            decorations.push({
                range: new monaco.Range(
                    rangeHighlight.startLine + 1,
                    rangeHighlight.startCol + 1,
                    rangeHighlight.endLine + 1,
                    rangeHighlight.endCol + 1,
                ),
                options: {
                    className: rangeHighlight.type === 'statement' ? 'inline-highlight-stmt' : 'inline-highlight-block',
                    inlineClassName:
                        rangeHighlight.type === 'statement'
                            ? 'inline-highlight-stmt'
                            : 'inline-highlight-block',
                },
            });
        }

        decorationsRef.current = editorRef.current.deltaDecorations(
            decorationsRef.current,
            decorations,
        );
    }, [lineHighlights, rangeHighlights]);

    useEffect(() => {
        if (!editorRef.current) return;
        if (editorRef.current.getValue() !== value) {
            editorRef.current.setValue(value);
        }
    }, [value]);

    return <div ref={containerRef} className={`monaco-editor-container ${className}`} />;
};

export default MonacoEditor;