import React, { useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCompiler } from '@/contexts/CompilerContext';
import MonacoEditor from '../common/MonacoEditor';
import { SIGMA16_IR_LANG_ID } from '@/languages/ir';
import { buildHighlightsForInstruction } from '@/services/highlighting';

const IrPanel: React.FC = () => {
    const { state, setSourceHighlights, setIrHighlights, setAsmHighlights } = useCompiler();
    const [mounted, setMounted] = React.useState(false);
    const lastInstrRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMount = setInterval(() => {
            const mountPoint = document.getElementById('ir-panel-mount');
            if (mountPoint) {
                setMounted(true);
                clearInterval(checkMount);
            }
        }, 100);

        return () => clearInterval(checkMount);
    }, []);

    const getIrContent = () => {
        if (!state.result || !state.result.ir) {
            return '// No IR generated - compile the source';
        }
        return state.result.ir.join('\n');
    };

    const clearHighlights = useCallback(() => {
        lastInstrRef.current = null;
        setSourceHighlights([]);
        setIrHighlights([]);
        setAsmHighlights([]);
    }, [setSourceHighlights, setIrHighlights, setAsmHighlights]);

    const handleIrHover = useCallback((line: number) => {
        if (!state.mapping || !state.result?.success || !state.result.ir) {
            if (lastInstrRef.current !== null) {
                clearHighlights();
            }
            return;
        }

        if (line < 0 || line >= state.result.ir.length) {
            clearHighlights();
            return;
        }

        if (line === lastInstrRef.current) {
            return;
        }

        lastInstrRef.current = line;
        const { sourceRanges, irLines, asmLines } = buildHighlightsForInstruction(line, state.mapping);
        setSourceHighlights(sourceRanges);
        setIrHighlights(irLines);
        setAsmHighlights(asmLines);
    }, [state.mapping, state.result?.success, state.result?.ir, setSourceHighlights, setIrHighlights, setAsmHighlights, clearHighlights]);

    const content = (
        <div className="ir-panel">
            <MonacoEditor
                value={getIrContent()}
                language={SIGMA16_IR_LANG_ID}
                theme="sigma16-ir-dark"
                readOnly={true}
                lineHighlights={state.irHighlights}
                className="ir-viewer"
                onMouseMove={handleIrHover}
                onMouseLeave={clearHighlights}
            />
        </div>
    );

    if (!mounted) return null;

    return ReactDOM.createPortal(
        content,
        document.getElementById('ir-panel-mount')!
    );
};

export default IrPanel;