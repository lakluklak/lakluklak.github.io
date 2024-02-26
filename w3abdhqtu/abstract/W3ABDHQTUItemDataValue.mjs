import {Dec2RawBE, Raw2Dec} from '../../rawcode/convert.mjs';

export class W3ABDHQTUItemDataValue {

    /** @param {boolean} adq */
    constructor(adq) {
        this.#adq = adq;
    }

    /** @type {boolean} */ #adq;
    list = [];

    /** @type {('integer'|'real'|'unreal'|'string')}*/
    #typeString;

    /** @param {('integer'|'real'|'unreal'|'string')} type */
    set typeString(type) {
        switch (type) {
            case 'integer':
                this.type = 0;
                break;
            case 'real':
                this.type = 1;
                break;
            case 'unreal':
                this.type = 2;
                break;
            case 'string':
                this.type = 3;
                break;
            default:
                throw new Error(`Missing string type: ${type}`);
        }
        this.#typeString = type;
    }

    /** @param {CDataView} view */
    read(view) {
        this.id = view.uint32BE;
        this.type = view.uint32;

        if (this.#adq) {
            this.level = view.uint32;
            this.data = view.uint32;
        }

        switch (this.type) {
            case 0:
                this.value = view.uint32;
                this.#typeString = 'integer';
                break;
            case 1:
                this.#typeString = 'real';
                this.value = view.float32;
                break;
            case 2:
                this.#typeString = 'unreal';
                this.value = view.float32;
                break;
            case 3:
                this.#typeString = 'string';
                this.value = view.string;
                break;
            default:
                throw new Error(`Unknown variable type: ${this.type}`);
        }
        this.end = view.uint32BE;
    }

    /** @param {CDataView} view */
    write(view) {
        if (this.id === undefined) throw new Error('⚠️id undefined');
        if (this.type === undefined) throw new Error('⚠️type undefined');
        if (this.value === undefined) throw new Error('⚠️value undefined');
        if (this.#adq) {
            if (this.level === undefined) throw new Error('⚠️level undefined');
            if (this.data === undefined) throw new Error('⚠️data undefined');
        }

        view.uint32BE = this.id;
        view.uint32 = this.type;

        if (this.#adq) {
            view.uint32 = this.level;
            view.uint32 = this.data;
        }

        switch (this.type) {
            case 0:
                view.uint32 = this.value;
                break;
            case 1:
            case 2:
                view.float32 = this.value;
                break;
            case 3:
                view.string = this.value;
                break;
            default:
                throw new Error(`Unknown variable type: ${this.type}`);
        }
        view.uint32BE = this.end;
    }

    /**
     * @param {string} rawId
     * @param {Object.<string, any>} attrMap
     * @param {Object.<string, W3ABDHQTUTOMLMapProperty>} typeMap
     */
    fromMap(rawId, attrMap, typeMap) {
        this.id = Raw2Dec(String(rawId));
        if (typeMap[rawId] === undefined) this.typeString = attrMap[`${rawId}Type`];
        else this.type = typeMap[rawId].type;

        switch (this.type) {
            case 0:
                this.#typeString = 'integer';
                break;
            case 1:
                this.#typeString = 'real';
                break;
            case 2:
                this.#typeString = 'unreal';
                break;
            case 3:
                this.#typeString = 'string';
                break;
            default:
                throw new Error(`Unknown variable type: ${this.type}`);
        }

        let end = attrMap[`${rawId}End`];
        if (end === undefined) this.end = 0;
        else {
            if (this.level === undefined) throw new Error('Missing level data');
            if (end instanceof Array) end = end[this.level - 1];
            this.end = typeof end === 'string' ? Raw2Dec(String(end)) : 0;
        }
    }

    toJSON() {
        return {
            id: Dec2RawBE(this.id),
            type: this.#typeString,
            level: this.level,
            data: this.data,
            value: this.value,
            end: this.end > 0 ? Dec2RawBE(this.end) : undefined,
        };
    }
}