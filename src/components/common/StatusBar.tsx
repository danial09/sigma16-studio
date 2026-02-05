import React, { useMemo } from 'react';
import { useCompiler } from '@/contexts/CompilerContext';

const StatusBar: React.FC = () => {
    const { state } = useCompiler();

    const message = useMemo(() => {
        if (state.isCompiling) return 'Compiling...';
        if (state.error) return 'Compilation Error';
        if (state.result) {
            const irCount = state.result.ir?.length || 0;
            const asmCount = state.result.asm?.length || 0;
            return `Compiled: ${irCount} IR, ${asmCount} ASM`;
        }
        return 'Ready';
    }, [state.isCompiling, state.error, state.result]);

    return (
        <div className={`status-bar ${state.error ? 'error' : ''}`}>
            {message}
        </div>
    );
};

export default StatusBar;
