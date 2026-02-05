import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';
import { useSettings } from '@/contexts/SettingsContext';
import { HighlightRange, LineHighlight } from '@/types/compiler.types';

interface MonacoEditorProps {
    value: string;
    onChange?: (value: string) => void;
    language: string;
    theme?: string;
    readOnly?: boolean;
    onCursorChange?: (line: number, column: number) => void;
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
    readOnly = false,
    lineHighlights = [],
    rangeHighlights = [],
    onMouseMove,
    onMouseLeave,
    className = '',
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const decorationsRef = useRef<string[]>([]);
    const { settings } = useSettings();

    // Store callbacks in refs so editor doesn't need to be recreated when they change
    const onChangeRef = useRef(onChange);
    const onMouseMoveRef = useRef(onMouseMove);
    const onMouseLeaveRef = useRef(onMouseLeave);

    useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
    useEffect(() => { onMouseMoveRef.current = onMouseMove; }, [onMouseMove]);
    useEffect(() => { onMouseLeaveRef.current = onMouseLeave; }, [onMouseLeave]);

    // Create editor once, only recreate if language or readOnly changes
    useEffect(() => {
        if (!containerRef.current) return;

        const editor = monaco.editor.create(containerRef.current, {
            value,
            language,
            theme: settings.theme === 'light' ? 'vs' : 'vs-dark',
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

        disposables.push(
            editor.onDidChangeModelContent(() => {
                onChangeRef.current?.(editor.getValue());
            }),
        );

        disposables.push(
            editor.onMouseMove((e) => {
                const pos = e.target.position;
                if (!pos) return;
                onMouseMoveRef.current?.(pos.lineNumber - 1, pos.column - 1);
            }),
        );

        disposables.push(
            editor.onMouseLeave(() => {
                onMouseLeaveRef.current?.();
            }),
        );

        return () => {
            disposables.forEach(d => d.dispose());
            editor.dispose();
            editorRef.current = null;
        };
        // Only recreate editor when language or readOnly changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, readOnly]);

    // Update theme without recreating editor
    useEffect(() => {
        if (!editorRef.current) return;
        const newTheme = settings.theme === 'light' ? 'vs' : 'vs-dark';
        monaco.editor.setTheme(newTheme);
    }, [settings.theme]);

    // Update font size without recreating editor
    useEffect(() => {
        if (!editorRef.current) return;
        editorRef.current.updateOptions({ fontSize: settings.fontSize });
    }, [settings.fontSize]);

    // Update decorations
    useEffect(() => {
        if (!editorRef.current) return;

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

    // Sync external value changes
    useEffect(() => {
        if (!editorRef.current) return;
        if (editorRef.current.getValue() !== value) {
            editorRef.current.setValue(value);
        }
    }, [value]);

    return <div ref={containerRef} className={`monaco-editor-container ${className}`} />;
};

export default MonacoEditor;
