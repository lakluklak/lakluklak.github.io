import fs from 'fs';
import path from 'node:path';

/**
 * @param {string} dir
 * @return {string[]}
 */
const fileListDir = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...fileListDir(name)] : [...files, name];
    }, []);

export {fileListDir as default};