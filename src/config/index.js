import fs from 'fs';
import path from 'path';

/* Parse config from JSON to Object */
const config = JSON.parse(fs.readFileSync(path.join(__dirname, './config.json')));
export default config;
