# Test Suite Desktop

A cross-platform desktop application for test suite automation tools, built with Electron, React, and Python.

## Features

- **SVN Inspector**: Upload and analyze SVN reports
- **Checklist Reviewer**: Process review checklists with hyperlink extraction
- **TC Traceability**: Validate test case traceability matrices
- **System Tray**: Runs in background with system tray icon
- **Auto-Updates**: Automatic application updates (production builds)
- **Native File Dialogs**: OS-native file selection
- **Cross-Platform**: Works on macOS and Windows

## Development

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip

### Setup

1. Install dependencies:
```bash
npm install
```

2. Install frontend dependencies:
```bash
cd frontend && npm install && cd ..
```

3. Install backend dependencies:
```bash
cd backend && pip install -r requirements.txt && cd ..
```

### Running in Development Mode

Start the application in development mode:
```bash
npm run dev
```

This will:
- Start the Python backend on port 8000
- Start the Electron app with hot reload
- Open DevTools automatically

Alternatively, run components separately:
```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Frontend (for web development)
npm run frontend:dev

# Terminal 3: Electron
npm run electron:dev
```

## Building for Production

### Build for Current Platform

```bash
npm run build
```

This creates installers in the `dist` directory.

### Build for Specific Platforms

```bash
# macOS
npm run electron:build:mac

# Windows
npm run electron:build:win

# Linux
npm run electron:build:linux
```

### Build Output

- **macOS**: `.dmg` and `.zip` files
- **Windows**: `.exe` installer and portable `.exe`
- **Linux**: `.AppImage` and `.deb` packages

## Project Structure

```
.
├── electron/              # Electron main process
│   ├── main.js           # Main process entry
│   ├── preload.js        # Preload script for IPC
│   └── backend-manager.js # Backend subprocess manager
├── frontend/             # React frontend
│   ├── src/
│   └── dist/            # Built frontend (generated)
├── backend/              # Python FastAPI backend
│   ├── app/
│   └── dist/            # Built backend (generated)
├── scripts/              # Build scripts
│   ├── build-backend.sh
│   └── build-all.sh
├── build/                # Build resources (icons)
└── package.json          # Root package.json

```

## Configuration

### Backend Port

The backend runs on port 8000 by default. To change:
- Development: Edit `BACKEND_PORT` in `electron/main.js`
- Production: Backend manager handles port configuration

### Auto-Updates

Auto-updates are configured in `package.json` under the `build` section. To enable:
1. Set up a release server or use GitHub releases
2. Configure `publish` settings in `package.json`
3. Updates will check automatically on app start

## Troubleshooting

### Backend Won't Start

- Check Python is installed: `python --version`
- Verify dependencies: `cd backend && pip install -r requirements.txt`
- Check logs in Electron DevTools console

### Build Fails

- Ensure all dependencies are installed: `npm install`
- Clear build cache: `rm -rf dist frontend/dist backend/dist`
- Try building components separately

### Icons Not Showing

- Ensure icon files exist in `build/` directory
- Rebuild the application: `npm run build`

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
