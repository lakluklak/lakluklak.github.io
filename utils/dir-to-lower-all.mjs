import fs from 'fs';
import path from 'node:path';

/** @param {string} dir */
const dirToLowerAll = dir => {
    for (const f of fs.readdirSync(dir)) {
        const nameOld = path.join(dir, f);
        const nameNew = path.join(dir, f.toLowerCase());
        fs.renameSync(nameOld, nameNew);
        if (fs.statSync(nameNew).isDirectory()) dirToLowerAll(nameNew);
    }
};

export {dirToLowerAll as default};
