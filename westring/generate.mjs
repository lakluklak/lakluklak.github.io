import fs from 'fs';

const text = fs.readFileSync('worldeditstrings.txt', {encoding: 'utf8'});

let out = '';

const map = new Map();

for (const s of text.split('\n')) {
    const list = s.split('=');
    if (list.length < 2) continue;
    const name = list.shift();
    let value = list.join('=');
    map.set(name, value);
    if (value.startsWith('WESTRING') && map.has(value)) value = map.get(value);
    out += `\t${name} : \`${value}\`,\n`;
}

out = `export default {\n${out}\n\}`;
fs.writeFileSync(`WESTRING.mjs`, out, {flag: 'w+'});