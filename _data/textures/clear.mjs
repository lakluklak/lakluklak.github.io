import fs from 'fs';
import fileListDir from '../../utils/file-list-dir.mjs';
import fileNameExtension from '../../utils/file-name-extension.mjs';
import dirRemoveEmpty from '../../utils/dir-remove-empty.mjs';
import dirToLowerAll from '../../utils/dir-to-lower-all.mjs';

const dir = './data';

const list = fileListDir(dir);

for (const f of list) {
    const ext = fileNameExtension(f);
    if (['blp', 'tga', 'mjs'].indexOf(ext) >= 0) continue;
    fs.unlinkSync(f);
}
dirRemoveEmpty(dir);
dirToLowerAll(dir);
