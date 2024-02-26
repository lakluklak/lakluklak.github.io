import {W3A} from '../../W3A.mjs';
import fs from 'fs';
import vbindiff from '../../../utils/vbindiff.mjs';

const ext = 'w3a';
const name = [
    'wa',
    'wa.test',
][0];

const w3a1 = new W3A(fs.readFileSync(`${name}.${ext}`));
w3a1.read();
fs.writeFileSync(`${name}.json`, JSON.stringify(w3a1, null, 2), {flag: 'w+'});
fs.writeFileSync(`${name}.toml`, w3a1.toTOML(), {flag: 'w+'});

const w3a2 = W3A.fromTOML(fs.readFileSync(`${name}.toml`, {encoding: 'utf8'}));
fs.writeFileSync(`${name}.test.${ext}`, Buffer.from(w3a2.write()), {flag: 'w+'});
fs.writeFileSync(`${name}.test.json`, JSON.stringify(w3a2, null, 2), {flag: 'w+'});

vbindiff(`${name}.${ext}`, `${name}.test.${ext}`);


