import React from 'react';
import { useCompiler } from '@/contexts/CompilerContext';
import { SIGMA16_ASM_LANG_ID } from '@/languages/asm';
import { buildHighlightsForAsmLine } from '@/services/highlighting';
import OutputPanel from './OutputPanel';

const AsmPanel: React.FC = () => {
    const { state } = useCompiler();

    return (
        <OutputPanel
            mountId="asm-panel-mount"
            language={SIGMA16_ASM_LANG_ID}
            theme="sigma16-asm-dark"
            className="asm-panel"
            lines={state.result?.asm}
            lineHighlights={state.asmHighlights}
            emptyMessage="; No assembly generated - enable &quot;Emit ASM&quot; and compile"
            buildHighlights={buildHighlightsForAsmLine}
        />
    );
};

export default AsmPanel;
