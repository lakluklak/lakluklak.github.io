import fs from 'fs';
import {W3I} from '../W3I.mjs';

const name = [
    'war3map.w3i',
][0];

const w3a = new W3I(fs.readFileSync(name));
w3a.read();

console.log('🏁 W3I: start');

if (w3a.errors.length) {
    console.log('⚠️', w3a.errors);
} else {
    console.log('🏆 W3I: end');
    const f2 = `${name}.json`;
    fs.writeFileSync(f2, JSON.stringify(w3a, null, 2), {flag: 'w+'});
}