import fs from 'fs';
import {W3A} from '../W3A.mjs';
import {W3B} from '../W3B.mjs';
import {W3D} from '../W3D.mjs';
import {W3H} from '../W3H.mjs';
import {W3Q} from '../W3Q.mjs';
import {W3T} from '../W3T.mjs';
import {W3U} from '../W3U.mjs';

/**
 * @param {string} name
 * @param {string} dir
 * @param {boolean} json
 */
const convert = (name, dir, json) => {
    const file = fs.readFileSync(`${dir}/${name}.${dir}`);

    /** @type {W3A|W3B|W3D|W3H|W3Q|W3T|W3U} */
    let w3;
    switch (dir) {
        case 'w3a':
            w3 = new W3A(file);
            break;
        case 'w3b':
            w3 = new W3B(file);
            break;
        case 'w3d':
            w3 = new W3D(file);
            break;
        case 'w3h':
            w3 = new W3H(file);
            break;
        case 'w3q':
            w3 = new W3Q(file);
            break;
        case 'w3t':
            w3 = new W3T(file);
            break;
        case 'w3u':
            w3 = new W3U(file);
            break;
        default:
            throw new Error(`Missing converter: ${dir}`);
    }
    w3.read();

    if (w3.errors.length) {
        console.log('⚠️', w3.errors);
    } else {
        if (json) fs.writeFileSync(`${name}.json`, JSON.stringify(w3, null, 2), {flag: 'w+'});
        else fs.writeFileSync(`${dir}/${name}.toml`, w3.toTOML(), {flag: 'w+'});
    }
};

convert('wa', 'w3a', false);
