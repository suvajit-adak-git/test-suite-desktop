const { spawn } = require('child_process');
const path = require('path');
const log = require('electron-log');
const axios = require('axios');
const fs = require('fs');

// Debug logging only in development - uses electron-log which stores in user data folder
const isDev = process.env.NODE_ENV === 'development' || !require('electron').app.isPackaged;

function debugLog(msg) {
    if (isDev) {
        log.debug('[BackendManager]', msg);
    }
}

class BackendManager {
    constructor(port, isDev) {
        this.port = port;
        this.isDev = isDev;
        this.process = null;
        this.isRunning = false;
    }

    async start() {
        debugLog('BackendManager.start() called'); // Added debug log
        log.info('Starting backend server...');
        debugLog(`START CALLED: isDev=${this.isDev}, port=${this.port}`);

        return new Promise((resolve, reject) => {
            try {
                let backendPath;
                let command;
                let args;

                if (this.isDev) {
                    // Development mode: run Python directly
                    backendPath = path.join(__dirname, '../backend');
                    command = 'python';
                    args = ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', this.port.toString()];

                    debugLog(`DEV MODE: command=${command}, args=${JSON.stringify(args)}, cwd=${backendPath}`);

                    this.process = spawn(command, args, {
                        cwd: backendPath,
                        env: { ...process.env, PYTHONUNBUFFERED: '1' },
                    });
                } else {
                    // Production mode: run packaged executable
                    const platform = process.platform;
                    const executableName = platform === 'win32' ? 'backend.exe' : 'backend';
                    const resourcesPath = process.resourcesPath;
                    backendPath = path.join(resourcesPath, 'backend', executableName);

                    debugLog(`resourcesPath: ${resourcesPath}`);
                    debugLog(`Looking for executable at: ${backendPath}`);

                    // Check if executable exists
                    if (!fs.existsSync(backendPath)) {
                        const error = `Backend executable not found at: ${backendPath}`;
                        debugLog(`ERROR: ${error}`);
                        log.error(error);
                        throw new Error(error);
                    }
                    debugLog(`Executable exists: true`);

                    log.info(`Backend executable path: ${backendPath}`);

                    command = backendPath;
                    args = ['--port', this.port.toString()];

                    log.info(`Spawning backend with command: ${command} and args: ${JSON.stringify(args)}`);
                    debugLog(`Spawning: ${command} ${JSON.stringify(args)} in cwd=${path.dirname(backendPath)}`);

                    this.process = spawn(command, args, {
                        cwd: path.dirname(backendPath), // Set CWD to backend directory
                        env: { ...process.env, PYTHONUNBUFFERED: '1' },
                        shell: process.platform === 'win32', // Required for Windows
                    });
                }

                this.process.stdout.on('data', (data) => {
                    const msg = data.toString();
                    log.info(`Backend stdout: ${msg}`);
                    debugLog(`STDOUT: ${msg}`);
                });

                this.process.stderr.on('data', (data) => {
                    const msg = data.toString();
                    log.error(`Backend stderr: ${msg}`);
                    debugLog(`STDERR: ${msg}`);
                });

                this.process.on('error', (error) => {
                    log.error('Backend process error:', error);
                    debugLog(`ERROR: ${error.message}`);
                    this.isRunning = false;
                    reject(error);
                });

                this.process.on('exit', (code, signal) => {
                    log.info(`Backend process exited with code ${code} and signal ${signal}`);
                    debugLog(`EXIT: code=${code} signal=${signal}`);
                    this.isRunning = false;
                });

                // Wait for backend to be ready
                this.waitForBackend()
                    .then(() => {
                        this.isRunning = true;
                        log.info('Backend is ready');
                        resolve();
                    })
                    .catch((error) => {
                        log.error('Backend failed to start:', error);
                        this.stop();
                        reject(error);
                    });
            } catch (error) {
                log.error('Error starting backend:', error);
                reject(error);
            }
        });
    }

    async waitForBackend(maxAttempts = 30, interval = 1000) {
        const url = `http://127.0.0.1:${this.port}/health`; // Use 127.0.0.1 instead of localhost to avoid IPv6 issues
        debugLog(`WAITING FOR BACKEND: url=${url}, maxAttempts=${maxAttempts}`);

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await axios.get(url, { timeout: 2000 });
                if (response.status === 200) {
                    debugLog(`HEALTH CHECK SUCCESS on attempt ${attempt}`);
                    return true;
                }
            } catch (error) {
                log.info(`Waiting for backend... (attempt ${attempt}/${maxAttempts})`);
                debugLog(`HEALTH CHECK FAILED attempt ${attempt}: ${error.message}`);
            }

            if (!this.process || this.process.exitCode !== null) {
                throw new Error('Backend process exited unexpectedly');
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        throw new Error('Backend failed to start within timeout period');
    }

    async stop() {
        if (this.process) {
            log.info('Stopping backend server...');

            return new Promise((resolve) => {
                if (!this.process) {
                    resolve();
                    return;
                }

                this.process.on('exit', () => {
                    this.process = null;
                    this.isRunning = false;
                    log.info('Backend stopped');
                    resolve();
                });

                // Try graceful shutdown first
                this.process.kill('SIGTERM');

                // Force kill after 5 seconds if still running
                setTimeout(() => {
                    if (this.process) {
                        log.warn('Force killing backend process');
                        this.process.kill('SIGKILL');
                    }
                }, 5000);
            });
        }
    }

    getStatus() {
        return {
            isRunning: this.isRunning,
            port: this.port,
            url: `http://127.0.0.1:${this.port}`,
        };
    }
}

module.exports = BackendManager;
