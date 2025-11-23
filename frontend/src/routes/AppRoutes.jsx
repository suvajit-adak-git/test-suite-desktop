import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Tool from '../pages/Tool';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/:toolId" element={<Tool />} />
        </Routes>
    );
};

export default AppRoutes;
