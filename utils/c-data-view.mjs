/** @module MDX */

export class CDataView extends DataView {
    /**
     * @param {ArrayBufferLike} buffer
     * @param {number?} byteOffset
     * @param {number?} byteLength
     */
    constructor(buffer, byteOffset, byteLength) {
        super(buffer, byteOffset, byteLength);
        this.cursor = 0;
    }

    /**
     * deprecated
     * @type {number}
     */
    cursor;

    /** @returns {number} */
    get uint8() {
        this.cursor += 1;
        return this.getUint8(this.cursor - 1);
    }

    /** @param {number} v */
    set uint8(v) {
        this.setUint8(this.cursor, v);
        this.cursor += 1;
    }

    /** @returns {number} */
    get uint16() {
        this.cursor += 2;
        return this.getUint32(this.cursor - 2, true);
    }

    /** @param {number} v */
    set uint16(v) {
        this.setUint16(this.cursor, v, true);
        this.cursor += 2;
    }

    /** @returns {number} */
    get uint32() {
        this.cursor += 4;
        return this.getUint32(this.cursor - 4, true);
    }

    /** @returns {number} */
    get uint32BE() {
        this.cursor += 4;
        return this.getUint32(this.cursor - 4, false);
    }

    /** @param {number} v */
    set uint32(v) {
        this.setUint32(this.cursor, v, true);
        this.cursor += 4;
    }

    /** @param {number} v */
    set uint32BE(v) {
        this.setUint32(this.cursor, v, false);
        this.cursor += 4;
    }

    /** @returns {number} */
    get float32() {
        this.cursor += 4;
        return this.getFloat32(this.cursor - 4, true);
    }

    /** @param {number} v */
    set float32(v) {
        this.setFloat32(this.cursor, v, true);
        this.cursor += 4;
    }

    /** @returns {string} */
    get string() {
        const list = [];
        while (this.cursor < this.byteLength) {
            const b = super.getUint8(this.cursor);
            this.cursor += 1;
            if (b === 0) break;
            list.push(b);
        }
        return new TextDecoder('utf-8').decode((new Uint8Array(list)).buffer);
    }

    /** @param {string} s */
    set string(s) {
        const list = new TextEncoder().encode(s);
        for (let i = 0; i < list.length; i++) {
            this.uint8 = list[i];
        }
        this.uint8 = 0;
    }

    /**
     * @param {number} length
     * @return {string}
     */
    getStringFixed(length) {
        let value = '';
        for (let i = 0; i < length; i++) {
            const b = this.uint8;
            if (b === 0) {
                this.cursor += length - i - 1;
                break;
            }
            value += String.fromCharCode(b);
        }
        return value;
    }

    /**
     * @param {string} value
     * @param {number} length
     */
    setStringFixed(value, length) {
        const str = value.padEnd(length, '\x00');
        for (let i = 0; i < length; i++) {
            this.uint8 = str.charCodeAt(i);
        }
    }

    /** @returns {number} */
    get sizeOffset() {
        this.cursor += 4;
        return this.cursor - 4;
    }

    /** @param {number} o */
    set sizeOffsetInclusive(o) {
        super.setUint32(o, this.cursor - o, true);
    }

    /** @param {number} o */
    set sizeOffsetExclusive(o) {
        super.setUint32(o, this.cursor - o - 4, true);
    }
}


