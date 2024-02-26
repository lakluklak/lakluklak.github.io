import {W3ABDHQTUItemDataValue} from './W3ABDHQTUItemDataValue.mjs';

export class W3ABDHQTUItemData {

    /**
     * @param {boolean} adq
     * @param {number} formatVersion
     */
    constructor(adq, formatVersion) {
        this.#adq = adq;
        this.#formatVersion = formatVersion;
    }

    /** @type {boolean} */ #adq;
    /** @type {number} */ #formatVersion;
    /** @type {W3ABDHQTUItemDataValue[]} */ list = [];

    /** @param {CDataView} view */
    read(view) {
        if (this.#formatVersion >= 3) this.flag = view.uint32;
        for (let i = view.uint32; i > 0; i--) {
            const v = new W3ABDHQTUItemDataValue(this.#adq);
            v.read(view);
            this.list.push(v);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        if (this.#formatVersion >= 3) {
            if (this.flag === undefined) throw new Error('⚠️flag undefined');
            view.uint32 = this.flag;
        }
        view.uint32 = this.list.length;
        for (const i of this.list) i.write(view);
    }

    toJSON() {
        return {
            flag: this.flag,
            list: this.list,
        };
    }
}