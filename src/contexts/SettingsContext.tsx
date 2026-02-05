import { createContext, useContext, useEffect, ReactNode } from 'react';
import { Settings } from '@/types/compiler.types';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface SettingsContextType {
    settings: Settings;
    updateSettings: (patch: Partial<Settings>) => void;
}

const DEFAULT_SETTINGS: Settings = {
    theme: 'dark',
    fontSize: 14,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useLocalStorage<Settings>('sigma16_settings', DEFAULT_SETTINGS);

    const updateSettings = (patch: Partial<Settings>) => {
        setSettings(prev => ({ ...prev, ...patch }));
    };

    useEffect(() => {
        const themeClass = settings.theme === 'light' ? 'theme-light' : 'theme-dark';
        const otherClass = settings.theme === 'light' ? 'theme-dark' : 'theme-light';
        document.body.classList.add(themeClass);
        document.body.classList.remove(otherClass);
    }, [settings.theme]);

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within SettingsProvider');
    }
    return context;
}
