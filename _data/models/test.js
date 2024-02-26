import * as fs from 'fs';
import {MDX} from '../../mdx/MDX.mjs';
import vbindiff from '../../utils/vbindiff.mjs';

const name = [
    'Footman',
    'heroarchmage_hd',
    'heroarchmage_ref',
    'Arthas',
    'Arthas_portrait',
    'sprite',
    'DNCAshenValeTerrain',
    'BlackDragon',
    'BlackDragon_Portrait',
    'candelabra_01.MESH',
    'heroarchmage',
    'HumanMale',
    'knight',
][0];

const f1 = `${name}.mdx`;
const buffer = fs.readFileSync(f1).buffer;

const model = new MDX(buffer);
model.read();
console.log('Read End!');
const b = model.write();
console.log('Write End!');

const f2 = `${name}_test.mdx`;
fs.writeFileSync(f2, '', {flag: 'w+'});
fs.appendFileSync(f2, Buffer.from(b));

console.log(JSON.stringify(model).slice(0, 100));

if (1) vbindiff(f1, f2);
