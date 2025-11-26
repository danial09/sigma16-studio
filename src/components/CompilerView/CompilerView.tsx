import React, { useEffect, useState } from 'react';
import Header from './Header';
import PanelLayout from './PanelLayout';
import { registerSigma16Source } from '@/languages/source';
import { registerSigma16Ir } from '@/languages/ir';
import { registerSigma16Asm } from '@/languages/asm';

const CompilerView: React.FC = () => {
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Register custom languages
        registerSigma16Source();
        registerSigma16Ir();
        registerSigma16Asm();
        setIsReady(true);
    }, []);

    if (!isReady) {
        return (
            <div className="loading-screen">
                <div className="spinner" />
                <p>Initializing compiler...</p>
            </div>
        );
    }

    return (
        <div className="compiler-view">
            <Header />
            <PanelLayout />
        </div>
    );
};

export default CompilerView;