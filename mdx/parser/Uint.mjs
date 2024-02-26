/** @module MDX */

export class Uint8 {

    /** @param {CDataView} view */
    read(view) {
        this.value = view.uint8;
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint8 = this.value;
    }

    toJSON() {
        return this.value;
    }
}

export class Uint16 {

    /** @param {CDataView} view */
    read(view) {
        this.value = view.uint16;
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint16 = this.value;
    }

    toJSON() {
        return this.value;
    }
}

export class Uint32 {

    /** @param {CDataView} view */
    read(view) {
        this.value = view.uint32;
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.value;
    }

    toJSON() {
        return this.value;
    }
}


export class Uint8List {
    /** @param {number} length */
    constructor(length = 1) {
        this.length = length;
    }

    /** @type {number[]} */ list = [];

    /** @param {CDataView} view */
    read(view) {
        for (let i = 0; i < this.length; i++) {
            this.list.push(view.uint8);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        for (const i of this.list) {
            view.uint8 = i;
        }
    }

    toJSON() {
        return this.list;
    }
}