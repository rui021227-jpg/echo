const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const expoBinPath = path.join(projectRoot, 'node_modules', '.bin', 'expo');

const patchedBin = `#!/usr/bin/env node

// Prefer the top-level Expo CLI when it is available, but fall back to Expo's
// bundled copy when package managers keep it nested under expo/node_modules.
try {
  require('@expo/cli');
} catch (error) {
  const missingTopLevelCli =
    error &&
    error.code === 'MODULE_NOT_FOUND' &&
    String(error.message || '').includes(\"'@expo/cli'\");

  if (!missingTopLevelCli) {
    throw error;
  }

  require('../expo/node_modules/@expo/cli/build/bin/cli');
}
`;

function main() {
  if (!fs.existsSync(expoBinPath)) {
    console.warn('[repair-expo-bin] Skipped: node_modules/.bin/expo not found.');
    return;
  }

  const current = fs.readFileSync(expoBinPath, 'utf8');
  if (current === patchedBin) {
    console.log('[repair-expo-bin] Expo launcher already patched.');
    return;
  }

  fs.writeFileSync(expoBinPath, patchedBin);
  fs.chmodSync(expoBinPath, 0o755);
  console.log('[repair-expo-bin] Patched node_modules/.bin/expo fallback.');
}

main();
