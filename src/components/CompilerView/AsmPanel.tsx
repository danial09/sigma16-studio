import React, { useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCompiler } from '@/contexts/CompilerContext';
import MonacoEditor from '../common/MonacoEditor';
import { SIGMA16_ASM_LANG_ID } from '@/languages/asm';
import { buildHighlightsForAsmLine } from '@/services/highlighting';

const AsmPanel: React.FC = () => {
    const { state, setSourceHighlights, setIrHighlights, setAsmHighlights } = useCompiler();
    const [mounted, setMounted] = React.useState(false);
    const lastAsmRef = useRef<number | null>(null);

    useEffect(() => {
        const checkMount = setInterval(() => {
            const mountPoint = document.getElementById('asm-panel-mount');
            if (mountPoint) {
                setMounted(true);
                clearInterval(checkMount);
            }
        }, 100);

        return () => clearInterval(checkMount);
    }, []);

    const getAsmContent = () => {
        if (!state.result || !state.result.asm) {
            return '; No assembly generated - enable "Emit ASM" and compile';
        }
        return state.result.asm.join('\n');
    };

    const clearHighlights = useCallback(() => {
        lastAsmRef.current = null;
        setSourceHighlights([]);
        setIrHighlights([]);
        setAsmHighlights([]);
    }, [setSourceHighlights, setIrHighlights, setAsmHighlights]);

    const handleAsmHover = useCallback((line: number) => {
        if (!state.mapping || !state.result?.success || !state.result.asm) {
            if (lastAsmRef.current !== null) {
                clearHighlights();
            }
            return;
        }

        if (line < 0 || line >= state.result.asm.length) {
            clearHighlights();
            return;
        }

        if (line === lastAsmRef.current) {
            return;
        }

        lastAsmRef.current = line;
        const { sourceRanges, irLines, asmLines } = buildHighlightsForAsmLine(line, state.mapping);
        setSourceHighlights(sourceRanges);
        setIrHighlights(irLines);
        setAsmHighlights(asmLines);
    }, [state.mapping, state.result?.success, state.result?.asm, setSourceHighlights, setIrHighlights, setAsmHighlights, clearHighlights]);

    const content = (
        <div className="asm-panel">
            <MonacoEditor
                value={getAsmContent()}
                language={SIGMA16_ASM_LANG_ID}
                theme="sigma16-asm-dark"
                readOnly={true}
                lineHighlights={state.asmHighlights}
                className="asm-viewer"
                onMouseMove={handleAsmHover}
                onMouseLeave={clearHighlights}
            />
        </div>
    );

    if (!mounted) return null;

    return ReactDOM.createPortal(
        content,
        document.getElementById('asm-panel-mount')!
    );
};

export default AsmPanel;