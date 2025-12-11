import React, { useEffect, useState } from 'react';


const UpdateNotifier = () => {
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // defined in preload.js
        if (window.electronAPI && window.electronAPI.onUpdateAvailable) {
            window.electronAPI.onUpdateAvailable(() => {
                setMessage('A new version is available. It will be downloaded in the background.');
                setShow(true);
                // Auto-hide after 10 seconds, or keep until user dismisses?
                // Let's keep it simple: auto-hide after 8s
                setTimeout(() => setShow(false), 8000);
            });
        }
    }, []);

    if (!show) return null;

    return (
        <div className="update-notification">
            <div className="update-content">
                <span className="update-icon">⬇️</span>
                <span className="update-message">{message}</span>
                <button className="update-close" onClick={() => setShow(false)}>×</button>
            </div>
        </div>
    );
};

export default UpdateNotifier;
