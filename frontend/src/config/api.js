// API configuration that detects environment and uses appropriate backend URL
let API_BASE_URL = 'http://localhost:8000/api';

// Check if running in Electron
if (window.electronAPI && window.electronAPI.isElectron) {
    // In Electron, get backend URL from main process
    window.electronAPI.getBackendUrl().then(url => {
        API_BASE_URL = `${url}/api`;
    });
} else {
    // In web browser, use environment variable or default
    API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
}

export const getApiUrl = () => API_BASE_URL;

export default {
    getApiUrl,
};
