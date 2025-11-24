import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
    return (
        <header className="header container">
            <div className="header-left">
                <Link to="/" className="header-logo">
                    <span className="logo-icon">▲</span>
                    <span className="logo-text">CS TESTING SUITE</span>
                </Link>
                <nav className="header-nav">
                    <a href="#" className="nav-link">Product</a>
                    <a href="#" className="nav-link">Use Cases ▾</a>
                    <a href="#" className="nav-link">Blog</a>
                    <a href="#" className="nav-link">Resources ▾</a>
                </nav>
            </div>
            <div className="header-right">
                <button className="btn-download">Download ↓</button>
            </div>
        </header>
    );
};

export default Header;
