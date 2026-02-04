import React, { useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCompiler } from '@/contexts/CompilerContext';
import MonacoEditor from '../common/MonacoEditor';
// Toolbar moved to its own component: PanelToolbar
import { SIGMA16_SOURCE_LANG_ID } from '@/languages/source';
import { collectIrHighlightsForAst, pickAstIdForPosition } from '@/services/highlighting';

const SourcePanel: React.FC = () => {
    const { state, updateSource, compile, setIrHighlights, setAsmHighlights } = useCompiler();
    const [mounted, setMounted] = React.useState(false);
    const lastAstRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMount = setInterval(() => {
            const mountPoint = document.getElementById('source-panel-mount');
            if (mountPoint) {
                setMounted(true);
                clearInterval(checkMount);
            }
        }, 100);

        return () => clearInterval(checkMount);
    }, []);

    // Use `compile` directly where needed; toolbar is rendered separately.

    const clearIrHighlights = useCallback(() => {
        lastAstRef.current = null;
        setIrHighlights([]);
        setAsmHighlights([]);
    }, [setIrHighlights, setAsmHighlights]);

    const handleSourceHover = useCallback((line: number, column: number) => {
        if (!state.mapping) {
            if (lastAstRef.current !== null) {
                clearIrHighlights();
            }
            return;
        }

        const astId = pickAstIdForPosition(line, column, state.mapping);
        if (astId === lastAstRef.current) {
            return;
        }

        if (astId == null) {
            clearIrHighlights();
            return;
        }

        lastAstRef.current = astId;
        const highlights = collectIrHighlightsForAst(astId, state.mapping);
        setIrHighlights(highlights.irLines);
        setAsmHighlights(highlights.asmLines);
    }, [state.mapping, setIrHighlights, setAsmHighlights, clearIrHighlights]);

    const content = (
        <div className="source-panel">
            {/* Toolbar moved out to `PanelToolbar` to align editors horizontally */}
            <div className="editor-container">
                <MonacoEditor
                    value={state.source}
                    onChange={updateSource}
                    language={SIGMA16_SOURCE_LANG_ID}
                    theme="sigma16-source-dark"
                    className="source-editor"
                    rangeHighlights={state.sourceHighlights}
                    onMouseMove={handleSourceHover}
                    onMouseLeave={clearIrHighlights}
                    onCompile={compile}
                />
            </div>
        </div>
    );

    if (!mounted) return null;

    return ReactDOM.createPortal(
        content,
        document.getElementById('source-panel-mount')!
    );
};

export default SourcePanel;