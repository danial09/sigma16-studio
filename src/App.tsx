import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SettingsProvider } from './contexts/SettingsContext';
import { CompilerProvider } from './contexts/CompilerContext';
import CompilerView from './components/CompilerView/CompilerView';
import Settings from './components/Settings/Settings';
import About from './components/About/About';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <SettingsProvider>
        <CompilerProvider>
          <Routes>
            <Route path="/" element={<CompilerView />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CompilerProvider>
      </SettingsProvider>
    </BrowserRouter>
  );
};

export default App;
