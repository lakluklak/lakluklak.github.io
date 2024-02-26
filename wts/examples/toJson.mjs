import fs from 'fs';
import {WTS} from '../WTS.mjs';

let name = 'example.wts';

const wts = new WTS(fs.readFileSync(name).toString());
console.log('🏁 Read: start');
wts.read();

if (wts.errors.length) {
    console.log('⚠️', wts.errors);
} else {
    console.log('🏆 Read: end');
    console.log(wts);
    for (const s of wts.strings) {
        console.log(s);
    }
    //fs.writeFileSync(`${name}.json`, JSON.stringify(wts, null, 2), {flag: 'w+'});
}