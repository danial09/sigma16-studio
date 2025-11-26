import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { CompilerState, CompilerOptions, CompilationResult, HighlightRange, Settings, LineHighlight, CompilerMappingSnapshot } from '@/types/compiler.types';
import { compileSource } from '@/services/compiler';
import { buildMappingSnapshot } from '@/services/highlighting';
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

interface CompilerContextType {
    state: CompilerState;
    settings: Settings;
    updateSource: (source: string) => void;
    updateOptions: (options: Partial<CompilerOptions>) => void;
    compile: () => Promise<void>;
    setSourceHighlights: (highlights: HighlightRange[]) => void;
    setIrHighlights: (lines: LineHighlight[]) => void;
    setAsmHighlights: (lines: LineHighlight[]) => void;
    updateSettings: (settings: Partial<Settings>) => void;
}

type Action =
    | { type: 'SET_SOURCE'; payload: string }
    | { type: 'SET_OPTIONS'; payload: Partial<CompilerOptions> }
    | { type: 'SET_COMPILING'; payload: boolean }
    | { type: 'SET_RESULT'; payload: CompilationResult }
    | { type: 'SET_ERROR'; payload: string }
    | { type: 'SET_SOURCE_HIGHLIGHTS'; payload: HighlightRange[] }
    | { type: 'SET_IR_HIGHLIGHTS'; payload: LineHighlight[] }
    | { type: 'SET_ASM_HIGHLIGHTS'; payload: LineHighlight[] }
    | { type: 'SET_SETTINGS'; payload: Partial<Settings> }
    | { type: 'SET_MAPPING'; payload: CompilerMappingSnapshot | null };

const initialState: CompilerState = {
    source: DEFAULT_SOURCE,
    options: {
        emitAsm: true,
        allocator: 'basic',
    },
    isCompiling: false,
    result: null,
    error: null,
    sourceHighlights: [],
    irHighlights: [],
    asmHighlights: [],
    mapping: null,
};

const initialSettings: Settings = {
    theme: 'dark',
    fontSize: 14,
};

function compilerReducer(state: CompilerState, action: Action): CompilerState {
    switch (action.type) {
        case 'SET_SOURCE':
            return { ...state, source: action.payload };
        case 'SET_OPTIONS':
            return { ...state, options: { ...state.options, ...action.payload } };
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
    const [state, dispatch] = useReducer(compilerReducer, initialState);
    const [settings, setSettings] = React.useState(initialSettings);

    // On mount, load persisted settings (if any)
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem('sigma16_settings');
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<typeof initialSettings>;
                setSettings(prev => ({ ...prev, ...parsed }));
            }
        } catch (e) {
        }
    }, []);

    // On mount, load persisted compiler options (if any)
    React.useEffect(() => {
        try {
            const raw = localStorage.getItem('sigma16_options');
            if (raw) {
                const parsed = JSON.parse(raw) as Partial<typeof initialState.options>;
                if (parsed && typeof parsed === 'object') {
                    dispatch({ type: 'SET_OPTIONS', payload: parsed });
                }
            }
        } catch (e) {
        }
    }, []);

    // Sync settings to localStorage and apply theme class
    React.useEffect(() => {
        try {
            localStorage.setItem('sigma16_settings', JSON.stringify(settings));
        } catch (e) {
        }

        const themeClass = settings.theme === 'light' ? 'theme-light' : 'theme-dark';
        const otherClass = settings.theme === 'light' ? 'theme-dark' : 'theme-light';
        if (typeof document !== 'undefined' && document.body) {
            document.body.classList.add(themeClass);
            document.body.classList.remove(otherClass);
        }
    }, [settings]);

    // Persist compiler options whenever they change
    React.useEffect(() => {
        try {
            localStorage.setItem('sigma16_options', JSON.stringify(state.options));
        } catch (e) {
        }
    }, [state.options]);

    const updateSource = useCallback((source: string) => {
        dispatch({ type: 'SET_SOURCE', payload: source });
    }, []);

    const updateOptions = useCallback((options: Partial<CompilerOptions>) => {
        dispatch({ type: 'SET_OPTIONS', payload: options });
    }, []);

    const compile = useCallback(async () => {
        dispatch({ type: 'SET_COMPILING', payload: true });
        try {
            const result = await compileSource(state.source, state.options);
            dispatch({ type: 'SET_RESULT', payload: result });
            dispatch({ type: 'SET_MAPPING', payload: buildMappingSnapshot(result) });
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

    const updateSettings = useCallback((newSettings: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    }, []);

    return (
        <CompilerContext.Provider
            value={{
                state,
                settings,
                updateSource,
                updateOptions,
                compile,
                setSourceHighlights,
                setIrHighlights,
                setAsmHighlights,
                updateSettings,
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