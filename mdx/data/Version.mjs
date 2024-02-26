/** @module MDX */

export class Version {

    /** @type {Vers} */ vers;

    /** @param {CDataView} view */
    read(view) {
        this.version = view.uint32;
        this.vers.version = this.version;
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.version;
    }

    toJSON() {
        return {
            version: this.version,
        };
    }
}
