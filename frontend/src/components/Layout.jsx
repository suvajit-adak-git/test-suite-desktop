import React from 'react';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="container">
                {children}
            </main>
        </div>
    );
};

export default Layout;
