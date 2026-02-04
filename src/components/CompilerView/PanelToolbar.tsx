import React from 'react';
import { useCompiler } from '@/contexts/CompilerContext';
import { examples, examplesList } from './examples';

const PanelToolbar: React.FC = () => {
    const { state, updateSource, compile } = useCompiler();

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

    return (
        <div className="panel-toolbar">
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
            </div>
        </div>
    );
};

export default PanelToolbar;
