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
                    <p>Version: 1.1.0</p>
                    <p>Built with React, TypeScript, Vite, and Tauri.</p>
                </section>

                <section className="nav-section">
                    <h2>About</h2>
                    <p>Sigma16 Studio is an educational tool designed to help students learn about computer architecture
                        and assembly language programming using the Sigma16 architecture.</p>
                    <p>It provides an interactive environment for visually exploring how high-level code translates to a
                        flattened intermediate low-level representation and then to assembly language</p>
                </section>

                <section className="nav-section">
                    <h2>Resources</h2>
                    <p>
                        <a href="https://github.com/danial09/sigma16-studio" target="_blank" rel="noopener noreferrer">
                            GitHub Repository
                        </a>
                    </p>
                </section>
            </div>
        </div>
    );
};

export default About;
