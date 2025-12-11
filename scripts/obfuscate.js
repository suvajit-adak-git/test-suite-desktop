const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SOURCE_DIR = path.join(__dirname, '../electron');
const DEST_DIR = path.join(__dirname, '../obfuscated-electron');

// Ensure destination directory exists
if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Obfuscation options
const options = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: true,
    renameGlobals: false,
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.75,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 2,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 4,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false
};

// Process files
try {
    const files = fs.readdirSync(SOURCE_DIR);

    files.forEach(file => {
        if (file.endsWith('.js')) {
            const sourcePath = path.join(SOURCE_DIR, file);
            const destPath = path.join(DEST_DIR, file);

            console.log(`Obfuscating ${file}...`);
            const code = fs.readFileSync(sourcePath, 'utf8');

            const obfuscationResult = JavaScriptObfuscator.obfuscate(code, options);

            fs.writeFileSync(destPath, obfuscationResult.getObfuscatedCode());
        }
    });

    console.log('Obfuscation complete.');
} catch (error) {
    console.error('Obfuscation failed:', error);
    process.exit(1);
}
