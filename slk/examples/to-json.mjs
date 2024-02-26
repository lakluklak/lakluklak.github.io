import fs from 'fs';
import {SLK} from '../SLK.mjs';

const ext = 'slk';
const name = [
    'wa',
    'wb',
][0];

const slk = new SLK(fs.readFileSync(`${name}.${ext}`, {encoding: 'utf8'}));
slk.read(true);

if (slk.errors.length) {
    console.log('⚠️', slk.errors);
} else {
    fs.writeFileSync(`${name}.json`, JSON.stringify(slk, null, 2), {flag: 'w+'});
}