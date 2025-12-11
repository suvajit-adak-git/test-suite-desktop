const { spawn } = require('child_process');
const path = require('path');
const log = require('electron-log');
const axios = require('axios');

class BackendManager {
    constructor(port, isDev) {
        this.port = port;
        this.isDev = isDev;
        this.process = null;
        this.isRunning = false;
    }

    async start() {
        log.info('Starting backend server...');

        return new Promise((resolve, reject) => {
            try {
                let backendPath;
                let command;
                let args;

                if (this.isDev) {
                    // Development mode: run Python directly
                    backendPath = path.join(__dirname, '../backend');
                    command = 'uvicorn';
                    args = ['app.main:app', '--host', '0.0.0.0', '--port', this.port.toString()];

                    this.process = spawn(command, args, {
                        cwd: backendPath,
                        env: { ...process.env, PYTHONUNBUFFERED: '1' },
                    });
                } else {
                    // Production mode: run packaged executable
                    const platform = process.platform;
                    const executableName = platform === 'win32' ? 'backend.exe' : 'backend';
                    backendPath = path.join(process.resourcesPath, 'backend', executableName);

                    command = backendPath;
                    args = ['--port', this.port.toString()];

                    this.process = spawn(command, args, {
                        env: { ...process.env },
                    });
                }

                this.process.stdout.on('data', (data) => {
                    log.info(`Backend stdout: ${data.toString()}`);
                });

                this.process.stderr.on('data', (data) => {
                    log.error(`Backend stderr: ${data.toString()}`);
                });

                this.process.on('error', (error) => {
                    log.error('Backend process error:', error);
                    this.isRunning = false;
                    reject(error);
                });

                this.process.on('exit', (code, signal) => {
                    log.info(`Backend process exited with code ${code} and signal ${signal}`);
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
        const url = `http://localhost:${this.port}/health`;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await axios.get(url, { timeout: 2000 });
                if (response.status === 200) {
                    return true;
                }
            } catch (error) {
                log.info(`Waiting for backend... (attempt ${attempt}/${maxAttempts})`);
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
            url: `http://localhost:${this.port}`,
        };
    }
}

module.exports = BackendManager;
