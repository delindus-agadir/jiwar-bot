import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = {
    version: new Date().getTime().toString(),
    buildDate: new Date().toISOString()
};

const publicDir = path.join(__dirname, '../public');
const versionFile = path.join(publicDir, 'version.json');

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

fs.writeFileSync(versionFile, JSON.stringify(version, null, 2));

console.log(`✅ Generated version.json: ${version.version}`);
