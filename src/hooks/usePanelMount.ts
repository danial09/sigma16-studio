import { useState, useEffect } from 'react';

export function usePanelMount(mountId: string): boolean {
    const [mounted, setMounted] = useState(() => !!document.getElementById(mountId));

    useEffect(() => {
        if (document.getElementById(mountId)) {
            setMounted(true);
            return;
        }

        const observer = new MutationObserver(() => {
            if (document.getElementById(mountId)) {
                setMounted(true);
                observer.disconnect();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        return () => observer.disconnect();
    }, [mountId]);

    return mounted;
}
