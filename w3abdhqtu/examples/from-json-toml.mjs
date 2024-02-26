import fs from 'fs';
import {W3A} from '../W3A.mjs';
import {W3B} from '../W3B.mjs';
import {W3D} from '../W3D.mjs';
import {W3H} from '../W3H.mjs';
import {W3U} from '../W3U.mjs';
import vbindiff from '../../utils/vbindiff.mjs';

/**
 * @param {string} name
 * @param {string} dir
 * @param {boolean} json
 */
const convert = (name, dir, json) => {
    const file = fs.readFileSync(`${dir}/${name}.toml`, {encoding: 'utf8'});

    /** @type {W3A|W3B|W3D|W3H|W3U} */
    let w3;
    switch (dir) {
        case 'w3a':
            w3 = json ? W3A.fromJSON(file) : W3A.fromTOML(file);
            break;
        case 'w3b':
            w3 = json ? W3B.fromJSON(file) : W3B.fromTOML(file);
            break;
        case 'w3d':
            w3 = json ? W3D.fromJSON(file) : W3D.fromTOML(file);
            break;
        case 'w3h':
            w3 = json ? W3H.fromJSON(file) : W3H.fromTOML(file);
            break;
        case 'w3u':
            w3 = json ? W3U.fromJSON(file) : W3U.fromTOML(file);
            break;
        default:
            throw new Error(`Missing converter: ${dir}`);
    }

    const f2 = `${dir}/${name}.test.${dir}`;
    fs.writeFileSync(f2, Buffer.from(w3.write()), {flag: 'w+'});

    vbindiff(`${dir}/${name}.${dir}`, f2);
};

convert('wa', 'w3a', false);
