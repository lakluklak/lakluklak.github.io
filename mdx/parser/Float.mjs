/** @module MDX */

export class Float32 {
    /** @param {CDataView} view */
    read(view) {
        this.value = view.float32;
    }

    /** @param {CDataView} view */
    write(view) {
        view.float32 = this.value;
    }

    toJSON() {
        return this.value;
    }
}

/** @module MDX */
export class Float32List {
    /** @param {number} length */
    constructor(length = 1) {
        this.length = length;
    }

    copy() {
        return new this.constructor(this.length);
    }

    /** @type {number[]} */ list = [];

    /** @param {CDataView} view */
    read(view) {
        for (let i = 0; i < this.length; i++) {
            this.list.push(view.float32);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        for (const i of this.list) {
            view.float32 = i;
        }
    }

    toJSON() {
        return this.list;
    }
}
