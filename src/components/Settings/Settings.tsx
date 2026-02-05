import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { useCompiler } from '@/contexts/CompilerContext';
import NavHeader from '../common/NavHeader';

const Settings: React.FC = () => {
    const { settings, updateSettings } = useSettings();
    const { state, updateOptions } = useCompiler();

    return (
        <div className="nav-page">
            <NavHeader title="Settings" />

            <div className="nav-content">
                <section className="nav-section">
                    <h2>Editor Settings</h2>

                    <div className="setting-item">
                        <label htmlFor="theme">Theme:</label>
                        <select
                            id="theme"
                            value={settings.theme}
                            onChange={(e) => updateSettings({ theme: e.target.value as 'dark' | 'light' })}
                        >
                            <option value="dark">Dark</option>
                            <option value="light">Light</option>
                        </select>
                    </div>

                    <div className="setting-item">
                        <label htmlFor="fontSize">Font Size:</label>
                        <input
                            type="number"
                            id="fontSize"
                            min="10"
                            max="24"
                            value={settings.fontSize}
                            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                        />
                    </div>

                </section>

                <section className="nav-section">
                    <h2>Compiler Settings</h2>

                    <div className="setting-item">
                        <label htmlFor="emitAsm">Emit ASM:</label>
                        <input
                            id="emitAsm"
                            type="checkbox"
                            checked={state.options.emitAsm}
                            onChange={(e) => updateOptions({ emitAsm: e.target.checked })}
                        />
                    </div>

                    <div className="setting-item">
                        <label htmlFor="allocator">Register Allocator:</label>
                        <select
                            id="allocator"
                            value={state.options.allocator}
                            onChange={(e) => updateOptions({ allocator: e.target.value as 'basic' | 'advanced' })}
                        >
                            <option value="basic">Basic</option>
                            <option value="advanced">Advanced (BUGGY)</option>
                        </select>
                        {state.options.allocator === 'advanced' && (
                            <div
                                className="setting-warning"
                                role="alert"
                            >
                                Warning: The advanced register allocator is known to be buggy and may produce incorrect
                                output. Use at your own risk.
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;