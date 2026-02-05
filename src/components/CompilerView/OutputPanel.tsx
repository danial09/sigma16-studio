import React, { useCallback, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useCompiler } from '@/contexts/CompilerContext';
import MonacoEditor from '../common/MonacoEditor';
import { usePanelMount } from '@/hooks/usePanelMount';
import { HighlightRange, LineHighlight, CompilerMappingSnapshot } from '@/types/compiler.types';

interface OutputPanelProps {
    mountId: string;
    language: string;
    theme: string;
    className: string;
    lines: string[] | null | undefined;
    lineHighlights: LineHighlight[];
    emptyMessage: string;
    buildHighlights: (
        line: number,
        mapping: CompilerMappingSnapshot,
    ) => { sourceRanges: HighlightRange[]; irLines: LineHighlight[]; asmLines: LineHighlight[] };
}

const OutputPanel: React.FC<OutputPanelProps> = ({
    mountId,
    language,
    theme,
    className,
    lines,
    lineHighlights,
    emptyMessage,
    buildHighlights,
}) => {
    const { state, setSourceHighlights, setIrHighlights, setAsmHighlights } = useCompiler();
    const mounted = usePanelMount(mountId);
    const lastLineRef = useRef<number | null>(null);

    const content = useMemo(() => {
        if (!lines) return emptyMessage;
        return lines.join('\n');
    }, [lines, emptyMessage]);

    const clearHighlights = useCallback(() => {
        lastLineRef.current = null;
        setSourceHighlights([]);
        setIrHighlights([]);
        setAsmHighlights([]);
    }, [setSourceHighlights, setIrHighlights, setAsmHighlights]);

    const handleHover = useCallback((line: number) => {
        if (!state.mapping || !state.result?.success || !lines) {
            if (lastLineRef.current !== null) clearHighlights();
            return;
        }

        if (line < 0 || line >= lines.length) {
            clearHighlights();
            return;
        }

        if (line === lastLineRef.current) return;

        lastLineRef.current = line;
        const { sourceRanges, irLines, asmLines } = buildHighlights(line, state.mapping);
        setSourceHighlights(sourceRanges);
        setIrHighlights(irLines);
        setAsmHighlights(asmLines);
    }, [state.mapping, state.result?.success, lines, buildHighlights, setSourceHighlights, setIrHighlights, setAsmHighlights, clearHighlights]);

    if (!mounted) return null;

    const panelContent = (
        <div className={className}>
            {state.error ? (
                <div className="error-display">
                    <div className="error-title">Compilation Error</div>
                    <div className="error-message">{state.error}</div>
                </div>
            ) : (
                <MonacoEditor
                    value={content}
                    language={language}
                    theme={theme}
                    readOnly={true}
                    lineHighlights={lineHighlights}
                    className={className.replace('-panel', '-viewer')}
                    onMouseMove={handleHover}
                    onMouseLeave={clearHighlights}
                />
            )}
        </div>
    );

    return ReactDOM.createPortal(panelContent, document.getElementById(mountId)!);
};

export default OutputPanel;
