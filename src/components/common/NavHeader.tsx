import React from 'react';
import { Link } from 'react-router-dom';

type NavHeaderProps = {
    title: string;
    backTo?: string;
};

const NavHeader: React.FC<NavHeaderProps> = ({ title, backTo = '/' }) => {
    return (
        <header className="nav-header">
            <Link to={backTo} className="back-link">← Back to Compiler</Link>
            <h1>{title}</h1>
        </header>
    );
};

export default NavHeader;
