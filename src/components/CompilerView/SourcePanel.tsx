import React, { useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCompiler } from '@/contexts/CompilerContext';
import MonacoEditor from '../common/MonacoEditor';
import { SIGMA16_SOURCE_LANG_ID } from '@/languages/source';
import { collectIrHighlightsForAst, pickAstIdForPosition } from '@/services/highlighting';
import { usePanelMount } from '@/hooks/usePanelMount';

const SourcePanel: React.FC = () => {
    const { state, updateSource, setIrHighlights, setAsmHighlights } = useCompiler();
    const mounted = usePanelMount('source-panel-mount');
    const lastAstRef = useRef<number | null>(null);

    const clearIrHighlights = useCallback(() => {
        lastAstRef.current = null;
        setIrHighlights([]);
        setAsmHighlights([]);
    }, [setIrHighlights, setAsmHighlights]);

    const handleSourceHover = useCallback((line: number, column: number) => {
        if (!state.mapping) {
            if (lastAstRef.current !== null) clearIrHighlights();
            return;
        }

        const astId = pickAstIdForPosition(line, column, state.mapping);
        if (astId === lastAstRef.current) return;

        if (astId == null) {
            clearIrHighlights();
            return;
        }

        lastAstRef.current = astId;
        const highlights = collectIrHighlightsForAst(astId, state.mapping);
        setIrHighlights(highlights.irLines);
        setAsmHighlights(highlights.asmLines);
    }, [state.mapping, setIrHighlights, setAsmHighlights, clearIrHighlights]);

    if (!mounted) return null;

    return ReactDOM.createPortal(
        <div className="source-panel">
            <div className="editor-container">
                <MonacoEditor
                    value={state.source}
                    onChange={updateSource}
                    language={SIGMA16_SOURCE_LANG_ID}
                    className="source-editor"
                    rangeHighlights={state.sourceHighlights}
                    onMouseMove={handleSourceHover}
                    onMouseLeave={clearIrHighlights}
                />
            </div>
        </div>,
        document.getElementById('source-panel-mount')!,
    );
};

export default SourcePanel;
