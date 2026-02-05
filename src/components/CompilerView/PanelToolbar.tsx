import React, { useState, useRef, useEffect } from 'react';
import { useCompiler } from '@/contexts/CompilerContext';
import { examples, exampleCategories } from './examples';

const PanelToolbar: React.FC = () => {
    const { state, updateSource, compile } = useCompiler();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleCompile = async () => {
        await compile();
    };

    const handleExampleSelect = (key: string) => {
        const example = (examples as Record<string, string>)[key];
        if (example != null) {
            updateSource(example);
            setIsMenuOpen(false);
            setOpenSubmenu(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
                setOpenSubmenu(null);
            }
        };

        if (isMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMenuOpen]);

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
                <div className="examples-menu" ref={menuRef}>
                    <span className="examples-label">Examples:</span>
                    <button
                        className="examples-trigger"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        Load example... ▾
                    </button>
                    {isMenuOpen && (
                        <div className="examples-dropdown">
                            {exampleCategories.map((category) => (
                                <div
                                    key={category.label}
                                    className="menu-category"
                                    onMouseEnter={() => setOpenSubmenu(category.label)}
                                >
                                    <div className={`menu-category-header ${openSubmenu === category.label ? 'active' : ''}`}>
                                        <span>{category.label}</span>
                                        <span>▸</span>
                                    </div>
                                    {openSubmenu === category.label && (
                                        <div className="submenu">
                                            {category.examples.map((ex) => (
                                                <div
                                                    key={ex.key}
                                                    className="submenu-item"
                                                    onClick={() => handleExampleSelect(ex.key)}
                                                >
                                                    {ex.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PanelToolbar;
