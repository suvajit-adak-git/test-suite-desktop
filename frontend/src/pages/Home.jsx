
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import ParticleBackground from '../components/ParticleBackground';
import '../styles/Home.css';
import svnImage from '../assets/svn-inspector.svg';
import checklistImage from '../assets/checklist-reviewer-svg.svg';
import tcTraceabilityImage from '../assets/tc-traceability-svg.svg';

const Home = () => {
    const navigate = useNavigate();

    const tools = [
        {
            id: 'svn',
            title: 'SVN Inspector',
            description: 'Upload and analyze SVN reports',
            route: '/svn-inspector',
            previewText: 'SVN',
            image: svnImage
        },
        {
            id: 'checklist',
            title: 'Checklist Reviewer',
            description: 'Process review checklists',
            route: '/checklist',
            previewText: 'CHECKLIST',
            image: checklistImage
        },
        {
            id: 'tc-traceability',
            title: 'TC Traceability',
            description: 'Validate TC traceability',
            route: '/tc-traceability',
            previewText: 'TC',
            image: tcTraceabilityImage
        }
    ];

    return (
        <Layout>
            <ParticleBackground />
            <section className="hero-section">
                <h1 className="hero-headline">
                    Automate <br />
                    <span className="hero-subheadline">Your Test Validation Process</span>
                </h1>
                <div className="hero-actions">
                    <button
                        className="lift-off-btn"
                        onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        <span className="apple-icon">🚀</span> Explore Tools
                    </button>
                    <button
                        className="btn-hero-secondary"
                        onClick={() => navigate('/use-cases')}
                    >
                        Explore use cases
                    </button>
                </div>
            </section>

            <section className="tools-section" id="tools-section">
                <h2 className="section-title">Available Tools</h2>
                <div className="tools-grid">
                    {tools.map(tool => (
                        <Card
                            key={tool.id}
                            title={tool.title}
                            description={tool.description}
                            route={`/${tool.id}`}
                            previewText={tool.previewText}
                            image={tool.image}
                        />
                    ))}
                </div>
            </section>
        </Layout>
    );
};

export default Home;
