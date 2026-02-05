import React from 'react';
import { useCompiler } from '@/contexts/CompilerContext';
import { SIGMA16_IR_LANG_ID } from '@/languages/ir';
import { buildHighlightsForInstruction } from '@/services/highlighting';
import OutputPanel from './OutputPanel';

const IrPanel: React.FC = () => {
    const { state } = useCompiler();

    return (
        <OutputPanel
            mountId="ir-panel-mount"
            language={SIGMA16_IR_LANG_ID}
            theme="sigma16-ir-dark"
            className="ir-panel"
            lines={state.result?.ir}
            lineHighlights={state.irHighlights}
            emptyMessage="// No IR generated - compile the source"
            buildHighlights={buildHighlightsForInstruction}
        />
    );
};

export default IrPanel;
