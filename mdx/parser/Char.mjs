/** @module MDX */

export class Char {
    /** @param {number} length */
    constructor(length = 1) {
        this.length = length;
    }

    copy() {
        return new this.constructor(this.length);
    }

    /** @type {string} */ value;

    /** @param {CDataView} view */
    read(view) {
        this.value = '';

        for (let i = 0; i < this.length; i++) {
            const b = view.uint8;
            if (b === 0) {
                view.cursor += this.length - i - 1;
                break;
            }
            this.value += String.fromCharCode(b);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        const str = this.value.padEnd(this.length, '\x00');
        for (let i = 0; i < this.length; i++) {
            view.uint8 = str.charCodeAt(i);
        }
    }

    toJSON() {
        return this.value;
    }
}