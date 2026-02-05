import { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { CompilerState, CompilerOptions, CompilationResult, HighlightRange, LineHighlight, CompilerMappingSnapshot } from '@/types/compiler.types';
import { compileSource } from '@/services/compiler';
import { buildMappingSnapshot } from '@/services/highlighting';
import { useLocalStorage } from '@/hooks/useLocalStorage';

const DEFAULT_SOURCE = `x = 5;
y = 10;
if x < y {
  z = x + y;
} else {
  z = x - y;
}

while z > 0 {
  z = z - 1;
  w = z * x + 2;
}
result = z + 100;

for i from 1 to 10 {
  result = result + i;
}`;

const DEFAULT_OPTIONS: CompilerOptions = {
    emitAsm: true,
    allocator: 'basic',
};

interface CompilerContextType {
    state: CompilerState;
    updateSource: (source: string) => void;
    updateOptions: (options: Partial<CompilerOptions>) => void;
    compile: () => Promise<void>;
    setSourceHighlights: (highlights: HighlightRange[]) => void;
    setIrHighlights: (lines: LineHighlight[]) => void;
    setAsmHighlights: (lines: LineHighlight[]) => void;
}

type Action =
    | { type: 'SET_SOURCE'; payload: string }
    | { type: 'SET_OPTIONS'; payload: CompilerOptions }
    | { type: 'SET_COMPILING'; payload: boolean }
    | { type: 'SET_RESULT'; payload: CompilationResult }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_SOURCE_HIGHLIGHTS'; payload: HighlightRange[] }
    | { type: 'SET_IR_HIGHLIGHTS'; payload: LineHighlight[] }
    | { type: 'SET_ASM_HIGHLIGHTS'; payload: LineHighlight[] }
    | { type: 'SET_MAPPING'; payload: CompilerMappingSnapshot | null };

function compilerReducer(state: CompilerState, action: Action): CompilerState {
    switch (action.type) {
        case 'SET_SOURCE':
            return { ...state, source: action.payload };
        case 'SET_OPTIONS':
            return { ...state, options: action.payload };
        case 'SET_COMPILING':
            return { ...state, isCompiling: action.payload };
        case 'SET_RESULT':
            return { ...state, result: action.payload, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, result: null };
        case 'SET_SOURCE_HIGHLIGHTS':
            return { ...state, sourceHighlights: action.payload };
        case 'SET_IR_HIGHLIGHTS':
            return { ...state, irHighlights: action.payload };
        case 'SET_ASM_HIGHLIGHTS':
            return { ...state, asmHighlights: action.payload };
        case 'SET_MAPPING':
            return { ...state, mapping: action.payload };
        default:
            return state;
    }
}

const CompilerContext = createContext<CompilerContextType | undefined>(undefined);

export function CompilerProvider({ children }: { children: ReactNode }) {
    const [persistedOptions, setPersistedOptions] = useLocalStorage<CompilerOptions>('sigma16_options', DEFAULT_OPTIONS);

    const [state, dispatch] = useReducer(compilerReducer, {
        source: DEFAULT_SOURCE,
        options: persistedOptions,
        isCompiling: false,
        result: null,
        error: null,
        sourceHighlights: [],
        irHighlights: [],
        asmHighlights: [],
        mapping: null,
    });

    const updateSource = useCallback((source: string) => {
        dispatch({ type: 'SET_SOURCE', payload: source });
    }, []);

    const updateOptions = useCallback((patch: Partial<CompilerOptions>) => {
        const next = { ...state.options, ...patch };
        dispatch({ type: 'SET_OPTIONS', payload: next });
        setPersistedOptions(next);
    }, [state.options, setPersistedOptions]);

    const compile = useCallback(async () => {
        dispatch({ type: 'SET_COMPILING', payload: true });
        try {
            const result = await compileSource(state.source, state.options);

            if (!result.success && result.error) {
                dispatch({ type: 'SET_ERROR', payload: result.error });
                dispatch({ type: 'SET_MAPPING', payload: null });
            } else {
                dispatch({ type: 'SET_RESULT', payload: result });
                dispatch({ type: 'SET_MAPPING', payload: buildMappingSnapshot(result) });
            }

            dispatch({ type: 'SET_SOURCE_HIGHLIGHTS', payload: [] });
            dispatch({ type: 'SET_IR_HIGHLIGHTS', payload: [] });
            dispatch({ type: 'SET_ASM_HIGHLIGHTS', payload: [] });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: String(error) });
            dispatch({ type: 'SET_MAPPING', payload: null });
            dispatch({ type: 'SET_SOURCE_HIGHLIGHTS', payload: [] });
            dispatch({ type: 'SET_IR_HIGHLIGHTS', payload: [] });
            dispatch({ type: 'SET_ASM_HIGHLIGHTS', payload: [] });
        } finally {
            dispatch({ type: 'SET_COMPILING', payload: false });
        }
    }, [state.source, state.options]);

    const setSourceHighlights = useCallback((highlights: HighlightRange[]) => {
        dispatch({ type: 'SET_SOURCE_HIGHLIGHTS', payload: highlights });
    }, []);

    const setIrHighlights = useCallback((lines: LineHighlight[]) => {
        dispatch({ type: 'SET_IR_HIGHLIGHTS', payload: lines });
    }, []);

    const setAsmHighlights = useCallback((lines: LineHighlight[]) => {
        dispatch({ type: 'SET_ASM_HIGHLIGHTS', payload: lines });
    }, []);

    return (
        <CompilerContext.Provider
            value={{
                state,
                updateSource,
                updateOptions,
                compile,
                setSourceHighlights,
                setIrHighlights,
                setAsmHighlights,
            }}
        >
            {children}
        </CompilerContext.Provider>
    );
}

export function useCompiler() {
    const context = useContext(CompilerContext);
    if (!context) {
        throw new Error('useCompiler must be used within CompilerProvider');
    }
    return context;
}
