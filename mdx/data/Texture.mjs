/** @module MDX */

export class Texture {

    #filenameSize = 260;

    #wrapWidthFlag = 0x1;
    #wrapHeightFlag = 0x2;

    /** @param {CDataView} view */
    read(view) {
        this.replaceableId = view.uint32;
        this.filename = view.getStringFixed(this.#filenameSize);
        let flags = view.uint32;
        this.wrapWidth = flags & this.#wrapWidthFlag > 0;
        this.wrapHeight = flags & this.#wrapHeightFlag > 0;
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.replaceableId;
        view.setStringFixed(this.filename, this.#filenameSize);
        let flags = 0;
        if (this.wrapWidth) flags |= this.#wrapWidthFlag;
        if (this.wrapHeight) flags |= this.#wrapHeightFlag;
        view.uint32 = flags;
    }

    toJSON() {
        return {
            replaceableId: this.replaceableId,
            filename: this.filename,
            wrapWidth: this.wrapWidth,
            wrapHeight: this.wrapHeight,
        };
    }
}