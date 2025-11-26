import React, { useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCompiler } from '@/contexts/CompilerContext';
import MonacoEditor from '../common/MonacoEditor';
import { examples, examplesList } from './examples';
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

    const handleCompile = async () => {
        await compile();
    };

    const handleExampleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        if (!key) return;
        const example = (examples as Record<string, string>)[key];
        if (example != null) {
            updateSource(example);
        }
    };

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
            <div className="source-toolbar">
                <button
                    className="compile-btn"
                    onClick={handleCompile}
                    disabled={state.isCompiling}
                >
                    {state.isCompiling ? 'Compiling...' : 'Compile'}
                </button>
                <label className="examples-label" style={{ marginLeft: 12 }}>
                    Examples:
                    <select
                        className="examples-select"
                        defaultValue=""
                        onChange={handleExampleSelect}
                        style={{ marginLeft: 8 }}
                    >
                        <option value="">Load example...</option>
                        {examplesList.map((ex) => (
                            <option key={ex.key} value={ex.key}>{ex.label}</option>
                        ))}
                    </select>
                </label>
                {/* Moved Emit ASM and Register Allocator into Settings page */}
            </div>
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
                    onCompile={handleCompile}
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