import {Dec2RawBE} from '../../rawcode/convert.mjs';
import {W3ABDHQTUItemData} from './W3ABDHQTUItemData.mjs';

export class W3ABDHQTUItem {

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
    /** @type {W3ABDHQTUItemData[]} */ list = [];

    /** @param {CDataView} view */
    read(view) {
        this.defaultId = view.uint32BE;
        this.customId = view.uint32BE;
        for (let i = this.#formatVersion >= 3 ? view.uint32 : 1; i > 0; i--) {
            const d = new W3ABDHQTUItemData(this.#adq, this.#formatVersion);
            d.read(view);
            this.list.push(d);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32BE = this.defaultId;
        view.uint32BE = this.customId;
        view.uint32 = this.list.length;
        for (const i of this.list) i.write(view);
    }

    toJSON() {
        return {
            defaultId: Dec2RawBE(this.defaultId),
            //defaultIdDec: this.defaultId,
            customId: this.customId > 0 ? Dec2RawBE(this.customId) : undefined,
            //customIdDec: this.customId > 0 ? this.customId : undefined,
            list: this.list,
        };
    }
}