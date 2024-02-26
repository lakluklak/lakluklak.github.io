// https://github.com/stijnherfst/HiveWE/wiki/war3map(skin).w3%2A-Modifications

import {CDataView} from '../../utils/c-data-view.mjs';
import {CDataViewFake} from '../../utils/c-data-view-fake.mjs';
import fromBuffer from '../../utils/bufffer-to-buffer.mjs';
import {W3ABDHQTUItem} from './W3ABDHQTUItem.mjs';
import {Dec2RawBE, Raw2Dec} from '../../rawcode/convert.mjs';
import {W3ABDHQTUItemData} from './W3ABDHQTUItemData.mjs';
import {W3ABDHQTUItemDataValue} from './W3ABDHQTUItemDataValue.mjs';
import * as TOML from '@ltd/j-toml';

/**
 * @typedef W3ABDHQTUTOMLMapProperty
 * @type {object}
 * @property {string} name
 * @property {number} type
 * @property {number?} data
 * @property {boolean?} level
 * @property {boolean?} singleline
 */

export class W3ABDHQTU {
    /**
     * @param {Buffer|ArrayBuffer} buffer
     * @param {boolean} adq
     */
    constructor(buffer, adq) {
        this.#buffer = fromBuffer(buffer);
        this.#adq = adq;
    }

    /** @type {ArrayBuffer} */ #buffer;
    /** @type {boolean} */ #adq;
    /** @type {Error[]} */ errors = [];
    /** @type {W3ABDHQTUItem[]} */ list = [];
    /** @type {W3ABDHQTUItem[]} */ #original = [];
    /** @type {W3ABDHQTUItem[]} */ #mofified = [];

    #read() {
        const view = new CDataView(this.#buffer);
        this.formatVersion = view.uint32;
        if ([1, 2, 3].indexOf(this.formatVersion) < 0) {
            throw new Error(`This format is unsupported: ${this.formatVersion}`);
        }

        for (let i = 0; i < 2; i++) {
            for (let i = view.uint32; i > 0; i--) {
                const data = new W3ABDHQTUItem(this.#adq, this.formatVersion);
                data.read(view);
                this.list.push(data);
            }
        }

        if (view.cursor !== view.byteLength) {
            throw new Error(`Read not complete: ${view.cursor} !== ${view.byteLength}`);
        }
    }

    read() {
        try {
            this.#read();
        } catch (e) {
            this.errors.push(e);
        }
    }

    /** @param {CDataView} view */
    #write(view) {
        view.uint32 = this.formatVersion;
        view.uint32 = this.#original.length;
        for (const i of this.#original) i.write(view);
        view.uint32 = this.#mofified.length;
        for (const i of this.#mofified) i.write(view);
    }

    write() {
        this.#original = [];
        this.#mofified = [];

        for (const i of this.list) {
            if (i.customId > 0) this.#mofified.push(i);
            else this.#original.push(i);
        }

        /** @type {CDataView} */
        const dvf = new CDataViewFake();
        this.#write(dvf);

        const ab = new ArrayBuffer(dvf.cursor);
        const dv = new CDataView(ab);
        this.#write(dv);

        return ab;
    }

    toJSON() {
        return {
            formatVersion: this.formatVersion,
            list: this.list,
        };
    }

    /**
     * @template T
     * @param {T} self
     * @param {string} json
     * @param {boolean} adq
     * @return {T}
     */
    static _fromJSON(self, json, adq) {
        const o = JSON.parse(json);
        self.formatVersion = o.formatVersion;
        for (const i of o.list) {
            const item = new W3ABDHQTUItem(adq, self.formatVersion);
            self.list.push(item);
            item.defaultId = Raw2Dec(String(i.defaultId));
            item.customId = i.customId === undefined ? 0 : Raw2Dec(String(i.customId));
            for (const id of i.list) {
                const itemData = new W3ABDHQTUItemData(adq, self.formatVersion);
                item.list.push(itemData);
                itemData.flag = id.flag === undefined ? 0 : Number(id.flag);
                for (const idv of id.list) {
                    const itemDataValue = new W3ABDHQTUItemDataValue(adq);
                    itemData.list.push(itemDataValue);
                    itemDataValue.id = Raw2Dec(String(idv.id));
                    if (adq) {
                        itemDataValue.level = idv.level;
                        itemDataValue.data = idv.data;
                    }
                    itemDataValue.typeString = idv.type;
                    itemDataValue.value = idv.value;
                    itemDataValue.end = idv.end === undefined ? 0 : Raw2Dec(String(idv.end));
                }
            }
        }
        return self;
    }

    /**
     * @param {Object.<string, W3ABDHQTUTOMLMapProperty>} map
     * @param {boolean} endblock
     * @param {boolean} forceType
     * @return {string}
     */
    _toTOML(map, {endblock = false, forceType = false} = {}) {
        let out = `[Settings]\nversion = ${this.formatVersion} # binary format version\n`;

        /**
         * @param {W3ABDHQTUItemDataValue} prop
         * @param {number} num
         * @return {string}
         */
        const _numberFormat = (prop, num) => Number.isInteger(num) ? num : parseFloat(num.toFixed(4)).toString();

        /**
         * @param {W3ABDHQTUItemDataValue} prop
         * @param {string} str
         * @param {boolean} singleline
         * @return {string}
         */
        const _stringFormat = (prop, str, singleline = false) => {
            const brace = singleline ? '"' : '"""';
            return `${brace}${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}${brace}`;
        };

        /**
         * @param {W3ABDHQTUItemDataValue} prop
         * @param value
         * @param {boolean} isString
         * @param {boolean} singleline
         */
        const _value = (prop, value, isString, singleline = false) => {
            const format = isString ? _stringFormat : _numberFormat;
            const tdef = isString ? 'string' : 'number';
            if ((prop.level ?? 0) === 0) return format(prop, value[0], singleline) + '\n';
            let out = `[\n`;
            for (let i = 0; i < value.length; i++) {
                const empty = typeof value[i] !== tdef;
                const comma = i < value.length - 1 ? ',' : '';
                out += empty ? `[]${comma} # use default value` : format(prop, value[i], singleline) + comma;
                out += '\n';
            }
            return `${out}]\n`;
        };

        /**
         * @param {W3ABDHQTUItemDataValue} prop
         * @param value
         * @param data
         * @param end
         */
        const _write = (prop, value, data, end) => {
            const name = `${Dec2RawBE(prop.id)}`;
            if (!(value instanceof Array)) value = [value];
            if (!(data instanceof Array)) data = [data];
            if (!(end instanceof Array)) end = [end];
            let endLength = 0;
            if (endblock) {
                for (let i = 0; i < end.length; i++) {
                    if (end[i] === undefined || end[i] === 0) {
                        end[i] = [];
                        continue;
                    }
                    endLength++;
                    end[i] = Dec2RawBE(end[i]);
                }
            }

            let showType = true;
            if (map[name] !== undefined) {
                showType = false;
                out += `# ${map[name].name}\n`;
            }

            if (showType || forceType) {
                switch (prop.type) {
                    case 0:
                        out += `${name}Type = "integer"\n`;
                        break;
                    case 1:
                        out += `${name}Type = "real"\n`;
                        break;
                    case 2:
                        out += `${name}Type = "unreal"\n`;
                        break;
                    case 3:
                        out += `${name}Type = "string"\n`;
                        break;
                    default:
                        throw new Error(`Unknown variable type: ${prop.type}`);
                }
            }

            out += `${name} = ${_value(prop, value, prop.type === 3, map[name]?.singleline ?? false)}`;
            if (value.length === 1 && prop.level > 0) out += `${name}Level = ${prop.level}\n`;

            if (map[name]?.data === undefined) {
                let skip = true;
                for (const d of data) {
                    if (d !== 0 && typeof d === 'number') {
                        skip = false;
                        break;
                    }
                }
                if (!skip) out += `${name}Data = ${_value(prop, data, false)}`;
            }

            if (endblock && endLength > 0) out += `${name}End = ${_value(prop, end, true, true)}`;
        };

        for (const item of this.list) {
            /**
             * @param {number} id
             * @return {string}
             * @private
             */
            const _raw = (id) => {
                return `# ${id} 0x${id.toString(16)}`;
            };
            const pId = item.customId > 0 ? item.customId : item.defaultId;
            out += `\n[${Dec2RawBE(pId)}] ${_raw(pId)}\n`;
            if (item.customId > 0) out += `parent = "${Dec2RawBE(item.defaultId)}" ${_raw(item.defaultId)}\n`;

            if (this.#adq) {
                for (const data of item.list) {
                    if (this.formatVersion >= 3 && data.flag > 0) out += `flags = ${data.flag}\n`;

                    // check level
                    let level = 0;
                    for (const prop of data.list) {
                        if (prop.id === 0x616c6576/*alev*/) {
                            level = prop.value;
                            break;
                        }
                    }

                    /** @type {Map<number, W3ABDHQTUItemDataValue[]>} */
                    const map = new Map();

                    for (const prop of data.list) {
                        if (!map.has(prop.id)) map.set(prop.id, []);
                        map.get(prop.id).push(prop);
                    }

                    map.forEach((list) => {
                        const propFirst = list[0];
                        if (propFirst.level === 0) {
                            _write(propFirst, propFirst.value, propFirst.data, propFirst.end);
                            return;
                        }
                        const value = new Array(level);
                        const data = new Array(level);
                        const end = new Array(level);

                        for (const prop of list) {
                            if (prop.level === 0) {
                                for (const p of list) {
                                    if (p.level > 0) throw new Error(`${Dec2RawBE(pId)}:${Dec2RawBE(p.id)} - property with 0 level has other levels`);
                                }
                                _write(propFirst, propFirst.value, propFirst.data, prop.end);
                                return;
                            }
                            const lvl = prop.level - 1;
                            value[lvl] = prop.value;
                            data[lvl] = prop.data;
                            end[lvl] = prop.end;
                        }
                        _write(propFirst, value, data, end);
                    });
                }
            } else {
                for (const data of item.list) {
                    if (this.formatVersion >= 3 && data.flag > 0) out += `flags = ${data.flag}\n`;
                    for (const prop of data.list) {
                        _write(prop, prop.value, prop.data, prop.end);
                    }
                }
            }
        }
        return out;
    }

    /**
     * @template T
     * @param {T} self
     * @param {string} toml
     * @param {boolean} adq
     * @param {Object.<string, W3ABDHQTUTOMLMapProperty>} map
     * @return {T}
     */
    static _fromTOML(self, toml, adq, map) {
        /** @type {Object.<string, any>} */
        const o = TOML.parse(toml, {
            joiner: '\n',
            bigint: false,
        });
        self.formatVersion = Number(o.Settings.version);
        delete o.Settings;

        for (const [itemRawId, propMap] of Object.entries(o)) {
            const item = new W3ABDHQTUItem(adq, self.formatVersion);
            self.list.push(item);
            if (propMap.parent === undefined) {
                item.defaultId = Raw2Dec(itemRawId);
            } else {
                item.defaultId = Raw2Dec(propMap.parent);
                item.customId = Raw2Dec(itemRawId);
            }
            delete propMap.parent;

            if (propMap.length === 0) continue;

            const itemData = new W3ABDHQTUItemData(adq, self.formatVersion);
            item.list.push(itemData);
            if (self.formatVersion >= 3) itemData.flag = 0;

            for (const [attrRawId, attrValue] of Object.entries(propMap)) {
                if (attrRawId.length !== 4) continue;
                if (map[attrRawId]?.level ?? false) {
                    let level = propMap['alev'];
                    if (level instanceof Array) level = level[0];
                    if (attrValue.length !== level) throw new Error(`⚠️${itemRawId} : missilng level data for '${attrRawId}'`);
                }

                if (attrValue instanceof Array) {
                    for (let i = 0; i < attrValue.length; i++) {
                        if (typeof attrValue[i] === 'object') continue;
                        const itemDataValue = new W3ABDHQTUItemDataValue(adq);
                        itemData.list.push(itemDataValue);
                        if (adq) {
                            itemDataValue.level = i + 1;
                            if (map[attrRawId]?.data !== undefined) {
                                itemDataValue.data = map[attrRawId]?.data;
                            } else {
                                const data = propMap[`${attrRawId}Data`];
                                if (data === undefined) itemDataValue.data = 0;
                                if (data instanceof Array) itemDataValue.data = data[i];
                            }
                        }
                        itemDataValue.fromMap(attrRawId, propMap, map);
                        itemDataValue.value = attrValue[i];
                    }
                    continue;
                }

                const itemDataValue = new W3ABDHQTUItemDataValue(adq);
                itemData.list.push(itemDataValue);
                if (adq) {
                    itemDataValue.level = propMap[`${attrRawId}Level`] ?? 0;
                    itemDataValue.data = propMap[`${attrRawId}Data`] ?? 0;
                }
                itemDataValue.fromMap(attrRawId, propMap, map);
                itemDataValue.value = attrValue;
            }
        }

        return self;
    }
}