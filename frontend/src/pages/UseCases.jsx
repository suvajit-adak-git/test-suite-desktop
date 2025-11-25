import React from 'react';
import Layout from '../components/Layout';
import ParticleBackground from '../components/ParticleBackground';
import '../styles/Home.css';

const UseCases = () => {
    return (
        <Layout>
            <ParticleBackground />
            <section className="hero-section">
                <h1 className="hero-headline">
                    Use Cases<br />
                    <span className="hero-subheadline">Explore practical applications</span>
                </h1>
                <p style={{
                    textAlign: 'center',
                    marginTop: '2rem',
                    fontSize: '1.1rem',
                    color: 'var(--text-secondary)',
                    maxWidth: '600px',
                    margin: '2rem auto'
                }}>
                    Discover how our testing suite tools can streamline your validation workflows.
                </p>
            </section>

            <section className="tools-section" id="use-cases-section">
                <h2 className="section-title">Coming Soon</h2>
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: 'var(--text-secondary)'
                }}>
                    <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
                        🚧 We're building amazing use case examples for you!
                    </p>
                    <p>
                        This section will showcase real-world scenarios and practical applications of our testing tools.
                    </p>
                </div>
            </section>
        </Layout>
    );
};

export default UseCases;
