import React, { useEffect, useState } from 'react';

/**
 * Component that provides desktop-specific functionality
 * Detects Electron environment and provides native file dialogs
 */
const useDesktopFeatures = () => {
    const [isElectron, setIsElectron] = useState(false);
    const [appVersion, setAppVersion] = useState('');

    useEffect(() => {
        // Check if running in Electron
        if (window.electronAPI && window.electronAPI.isElectron) {
            setIsElectron(true);

            // Get app version
            window.electronAPI.getAppVersion().then(version => {
                setAppVersion(version);
            });

            // Listen for update notifications
            window.electronAPI.onUpdateAvailable(() => {
                console.log('Update available!');
                // You can show a notification to the user here
            });
        }
    }, []);

    /**
     * Open native file dialog
     * @param {Object} options - Dialog options
     * @returns {Promise<string[]>} Selected file paths
     */
    const openFileDialog = async (options = {}) => {
        if (!isElectron) {
            console.warn('File dialog only available in desktop mode');
            return null;
        }

        try {
            const result = await window.electronAPI.openFileDialog(options);
            if (!result.canceled && result.filePaths.length > 0) {
                return result.filePaths;
            }
            return null;
        } catch (error) {
            console.error('Error opening file dialog:', error);
            return null;
        }
    };

    /**
     * Save file dialog
     * @param {Object} options - Dialog options
     * @returns {Promise<string>} Selected save path
     */
    const saveFileDialog = async (options = {}) => {
        if (!isElectron) {
            console.warn('Save dialog only available in desktop mode');
            return null;
        }

        try {
            const result = await window.electronAPI.saveFileDialog(options);
            if (!result.canceled && result.filePath) {
                return result.filePath;
            }
            return null;
        } catch (error) {
            console.error('Error opening save dialog:', error);
            return null;
        }
    };

    /**
     * Show native notification
     * @param {Object} options - Notification options
     */
    const showNotification = async (options) => {
        if (!isElectron) {
            // Fallback to web notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(options.title, options);
            }
            return;
        }

        try {
            await window.electronAPI.showNotification(options);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    };

    /**
     * Get backend URL
     * @returns {Promise<string>} Backend URL
     */
    const getBackendUrl = async () => {
        if (!isElectron) {
            return 'http://localhost:8000';
        }

        try {
            return await window.electronAPI.getBackendUrl();
        } catch (error) {
            console.error('Error getting backend URL:', error);
            return 'http://localhost:8000';
        }
    };

    return {
        isElectron,
        appVersion,
        openFileDialog,
        saveFileDialog,
        showNotification,
        getBackendUrl,
    };
};

export default useDesktopFeatures;
