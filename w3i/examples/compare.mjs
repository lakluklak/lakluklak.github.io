import * as fs from 'fs';
import {W3I} from '../W3I.mjs';
import vbindiff from '../../utils/vbindiff.mjs';

const name = [
    'war3map',
][0];

const f1 = `${name}.w3i`;

console.log('🏁 W3I: start');
const w3i = new W3I(fs.readFileSync(f1));
w3i.read();
if (w3i.errors.length) {
    console.log('⚠️', w3i.errors);
} else {
    console.log('🏆 W3I: read end');

    const b = w3i.write();
    console.log('🏆 W3I: write end');

    const f2 = `${name}.test.w3i`;
    fs.writeFileSync(f2, '', {flag: 'w+'});
    fs.appendFileSync(f2, Buffer.from(b));

    vbindiff(f1, f2);
}