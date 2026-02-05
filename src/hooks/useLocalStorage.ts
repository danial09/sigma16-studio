import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw) {
                return { ...initialValue, ...JSON.parse(raw) } as T;
            }
        } catch {
            // Corrupted data - fall through to default
        }
        return initialValue;
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(storedValue));
        } catch {
            // Storage full or unavailable
        }
    }, [key, storedValue]);

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        setStoredValue(prev => {
            const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
            return next;
        });
    }, []);

    return [storedValue, setValue];
}
