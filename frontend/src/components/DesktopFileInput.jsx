import React from 'react';
import useDesktopFeatures from '../hooks/useDesktopFeatures';
import '../styles/DesktopFileInput.css';

/**
 * Enhanced file input component that uses native dialogs in desktop mode
 * Falls back to web file input in browser mode
 */
const DesktopFileInput = ({
    onFileSelect,
    accept = '.xlsx,.xls,.xlsm,.csv',
    buttonText = 'Choose File',
    className = '',
    multiple = false
}) => {
    const { isElectron, openFileDialog } = useDesktopFeatures();
    const [selectedFileName, setSelectedFileName] = React.useState('');

    const handleFileSelect = async () => {
        if (isElectron) {
            // Use native dialog in desktop mode
            const extensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
            const filePaths = await openFileDialog({
                filters: [
                    { name: 'Supported Files', extensions },
                    { name: 'All Files', extensions: ['*'] }
                ],
                properties: multiple ? ['openFile', 'multiSelections'] : ['openFile']
            });

            if (filePaths && filePaths.length > 0) {
                const filePath = filePaths[0];
                setSelectedFileName(filePath.split('/').pop());

                // Read file and create File object
                // In Electron, we'll need to read the file from the path
                // For now, we'll pass the path to the parent component
                onFileSelect({ path: filePath, name: filePath.split('/').pop() });
            }
        }
    };

    const handleWebFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFileName(file.name);
            onFileSelect(file);
        }
    };

    if (isElectron) {
        return (
            <div className={`desktop-file-input ${className}`}>
                <button
                    type="button"
                    onClick={handleFileSelect}
                    className="desktop-file-button"
                >
                    {buttonText}
                </button>
                {selectedFileName && (
                    <span className="selected-file-name">{selectedFileName}</span>
                )}
            </div>
        );
    }

    // Web mode: use standard file input
    return (
        <div className={`web-file-input ${className}`}>
            <input
                type="file"
                accept={accept}
                onChange={handleWebFileSelect}
                multiple={multiple}
                className="file-input"
            />
        </div>
    );
};

export default DesktopFileInput;
