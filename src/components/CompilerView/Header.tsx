import React from 'react';
import { Link } from 'react-router-dom';
import StatusBar from '../common/StatusBar';

const Header: React.FC = () => {
    return (
        <header className="app-header">
            <h1>Sigma16 Studio</h1>
            <StatusBar />
            <nav className="header-links">
                <Link to="/about" className="nav-link">About</Link>
                <Link to="/settings" className="nav-link">Settings</Link>
            </nav>
        </header>
    );
};

export default Header;
