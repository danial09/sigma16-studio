import React from 'react';
import NavHeader from '../common/NavHeader';

const About: React.FC = () => {
    return (
        <div className="nav-page">
            <NavHeader title="About" />

            <div className="nav-content">
                <section className="nav-section">
                    <h2>Sigma16 Studio</h2>
                    <p>Web-based Sigma16 compiler and development environment.</p>
                    <p>Version: 0.1.0</p>
                    <p>Built with React, TypeScript, Vite, and Tauri.</p>
                </section>

                <section className="nav-section">
                    <h2>Resources</h2>
                    <p>
                        <a href="https://github.com/" target="_blank" rel="noopener noreferrer">Project repository</a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;
