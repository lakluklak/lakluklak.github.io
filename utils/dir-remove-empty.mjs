import fs from 'fs';
import path from 'node:path';

/** @param {string} dir */
export const dirRemoveEmpty = dir => {
    if (!fs.statSync(dir).isDirectory()) return;
    let files = fs.readdirSync(dir);

    if (files.length > 0) {
        files.forEach((file) => dirRemoveEmpty(path.join(dir, file)));
        files = fs.readdirSync(dir);
    }

    if (files.length === 0) fs.rmdirSync(dir);
};

export {dirRemoveEmpty as default};