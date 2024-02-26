// noinspection JSUnresolvedReference

import XLSX from 'xlsx';
import fs from 'fs';

/**
 * @param {string} name
 * @return {unknown[]}
 */
const getFile = (name) => {
    const workbook = XLSX.readFile(`slk/${name}`);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
        defval: null,
    });
};

const map = {};
const dir = '../../_data/slk'

let file = 'AbilityData.slk';
for (const i of getFile(file)) {
    if (i.alias === null) continue;
    map[i.alias] = [file, i.comments];
    map[i.code] = [file, i.comments];
}

file = 'DestructableData.slk';
for (const i of getFile(file)) {
    if (i.DestructableID === null) continue;
    map[i.DestructableID] = [file, i.file];
}

file = 'ItemData.slk';
for (const i of getFile(file)) {
    if (i.itemID === null) continue;
    map[i.itemID] = [file, i.comment];
}

file = 'UnitData.slk';
for (const i of getFile(file)) {
    if (i.unitID === null) continue;
    map[i.unitID] = [file, i['comment(s)']];
}

file = 'UnitMetaData.slk';
for (const i of getFile(file)) {
    if (i.ID === null) continue;
    map[i.ID] = [file, i.field];
}

file = 'UpgradeData.slk';
for (const i of getFile(file)) {
    if (i.upgradeid === null) continue;
    map[i.upgradeid] = [file, i.comments];
}

fs.writeFileSync('data.mjs', `export default ${JSON.stringify(map, null, 4)}`, {flag: 'w+'});
