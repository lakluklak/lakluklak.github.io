import {SLK} from '../../slk/SLK.mjs';
import fs from 'fs';
import WESTRING from '../../westring/WESTRING.mjs';

/**
 * @param {string} dir
 * @param {string} table
 */
const generate = (dir, table) => {
    const slk = new SLK(fs.readFileSync(`${dir}/${table}`, {encoding: 'utf8'}));
    slk.read(true);

    let out = '';

    for (const map of slk.maps) {
        const {ID, field, repeat, data, displayName, type} = map;

        let typeInt = -1;
        let singleline = true;

        switch (type) {
            case 'bool':
                typeInt = 0;
                break;
            case 'real':
                typeInt = 1;
                break;
            case 'unreal':
                typeInt = 2;
                break;
            case 'string':
                typeInt = 3;
                singleline = false;
                break;
            case 'attackBits': // unit
            case 'channelFlags': // ability, unit
            case 'channelType': // ability, unit
            case 'detectionType': // unit
            case 'deathType': // unit
            case 'defenseTypeInt': // unit
            case 'fullFlags': // unit
            case 'int': // all
            case 'interactionFlags': // unit
            case 'morphFlags': // unit
            case 'pickFlags': // unit
            case 'silenceFlags': // unit
            case 'spellDetail': // buff
            case 'stackFlags': // unit
            case 'teamColor': // unit
            case 'unitCode':
            case 'upgradeCode':
            case 'versionFlags': // unit
                typeInt = 0;
                break;
            case 'abilCode': // unit
            case 'abilityList': // unit
            case 'abilitySkinList':
            case 'armorType': // unit
            case 'attributeType': // unit
            case 'attackType': // unit
            case 'aiBuffer': // unit
            case 'buffList': // ability
            case 'char': // unit
            case 'combatSound': // unit
            case 'defenseType': // unit
            case 'destructableCategory': // destructable
            case 'doodadCategory': // doodad
            case 'effectList': // ability
            case 'heroAbilityList': // unit
            case 'icon': // unit
            case 'intList': // ability, unit
            case 'itemClass': // unit
            case 'itemList': // unit
            case 'lightningEffect': // buff
            case 'lightningList':
            case 'modelList': // unit
            case 'model': // unit
            case 'moveType': // unit
            case 'orderString': // ability
            case 'pathingListPrevent': // unit
            case 'pathingListRequire': // unit
            case 'pathingTexture': // unit
            case 'regenType': // unit
            case 'soundLabel': // unit
            case 'stringList': // unit
            case 'shadowTexture': // unit
            case 'shadowImage': // unit
            case 'targetList': // ability, unit
            case 'techList': // ability, unit
            case 'texture':
            case 'tilesetList': // unit
            case 'uberSplat': // unit
            case 'unitClass': // unit
            case 'unitSound': // unit
            case 'unitRace': // ability, unit
            case 'unitList': // unit
            case 'upgradeEffect': // upgrade
            case 'upgradeClass': // upgrade
            case 'upgradeList': // unit
            case 'unitSkinList':
            case 'weaponType': // unit
                typeInt = 3;
                break;
            default:
                throw new Error(`Missing type: ${type}`);
        }

        out += '\t';
        out += `${ID}: {`;
        out += `type: ${typeInt}`;
        if (data !== undefined) out += `, data : ${data}`;
        out += `, name: \`(${type}) ${field}`;
        if ((repeat ?? 0) > 0) out += ` [multilevel]`;
        out += `: ${WESTRING[displayName]}\``;
        out += `${repeat > 0 ? ', level : true' : ''}${singleline ? ', singleline : true' : ''}},\n`;
    }

    out = `/** @type {Object.<string, W3ABDHQTUTOMLMapProperty>} */\nconst map = \{\n${out}\n\};\nexport default map;`;
    fs.writeFileSync(`${dir}/${dir.toUpperCase()}TOMLMap.mjs`, out, {flag: 'w+'});

};

generate('w3a', 'abilitymetadata.slk');
generate('w3b', 'destructablemetadata.slk');
generate('w3d', 'doodadmetadata.slk');
generate('w3h', 'abilitybuffmetadata.slk');
generate('w3q', 'upgrademetadata.slk');
generate('w3u', 'unitmetadata.slk');