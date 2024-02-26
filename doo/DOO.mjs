export class DOO {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        this.#buffer = buffer;
    }

    /** @type {ArrayBuffer} */ #buffer;

}