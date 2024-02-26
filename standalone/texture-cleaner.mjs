import * as path from 'path';
import * as fs from 'fs';

const DIR = 'models/test';
const MOVE = false;
const TEMP = 'models/temp';
const LUA = 'models/test/dd/war3map.lua';
const EXTENSIONS = ['.blp', '.dds'];
const EXCLUDE = [
    'war3map.blp',
];

const getAllFiles = dir =>
    fs.readdirSync(dir).reduce((files, file) => {
        const name = path.join(dir, file);
        const isDirectory = fs.statSync(name).isDirectory();
        return isDirectory ? [...files, ...getAllFiles(name)] : [...files, name];
    }, []);

const models = getAllFiles(DIR).filter(f => path.extname(f).toLowerCase() === '.mdx');

const map = new Map();

for (const file of models) {
    console.log(`👉 Read model: ${file}`);
    const data = fs.readFileSync(file);
    const buffer = new ArrayBuffer(data.length);
    data.copy(new Uint8Array(buffer));
    const view = new DataView(buffer);

    let byteOffset = 4;
    while (byteOffset < view.byteLength) {
        const key = view.getUint32(byteOffset, true);
        const byteLength = view.getUint32(byteOffset += 4, true);
        byteOffset += 4;
        if (key === 0x53584554) {
            const end = byteOffset + byteLength;
            for (let i = byteOffset; i < end; i += 268) {
                let s = '';
                for (let k = 4; k < 264; k++) {
                    const b = view.getUint8(i + k);
                    if (b === 0x00) break;
                    s += String.fromCharCode(b);
                }
                if (s.length === 0) continue;
                const p = path.normalize(path.join(DIR, s.toLowerCase().replace('\\', path.sep)));
                console.log(`Found texture: ${p}`);
                map.set(p, true);
            }
            break;
        }
        byteOffset += byteLength;
    }
}

const textures = getAllFiles(DIR).filter(f => EXTENSIONS.indexOf(path.extname(f).toLowerCase()) >= 0);

const folders = [];

for (const e of EXCLUDE) {
    const p = path.join(DIR, e).toLowerCase();

    if (path.extname(p).length === 0) {
        folders.push(`${p}${path.sep}`);
    } else {
        map.set(p, true);
    }

}

let moved = 0;
const luaExists = fs.existsSync(LUA);
let luaContent;
if (luaExists) {
    luaContent = fs.readFileSync(LUA, 'utf8').toLowerCase();
}

console.log('💀 START CLEAN');

loop:
    for (const t of textures) {
        const lt = t.toLowerCase();
        if (map.has(lt)) continue;

        for (const f of folders) {
            if (lt.startsWith(f)) continue loop;
        }

        const name = t.startsWith(DIR) ? t.slice(DIR.length) : t;

        if (luaExists) {
            const p = path.parse(name);
            const n = path.normalize(p.dir + path.sep + p.name).slice(1).replaceAll(path.sep, '\\\\').toLowerCase();
            if (luaContent.indexOf(n) >= 0) {
                console.log(`Lua skip: ${name}`);
                continue;
            }
        }

        if (MOVE) {
            moved++;
            console.log(`Move: ${t}`);
            const p = path.join(TEMP, name);
            fs.mkdirSync(path.dirname(p), {recursive: true});
            fs.renameSync(t, p);
        } else {
            console.log(`Found: ${t}`);
        }
    }
console.log(`💋 Files moved: ${moved}`);