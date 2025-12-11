import React from 'react';
import Header from './Header';
import UpdateNotifier from './UpdateNotifier';

const Layout = ({ children }) => {
    return (
        <div className="layout">
            <Header />
            <main className="container">
                {children}
            </main>
            <UpdateNotifier />
        </div>
    );
};

export default Layout;
