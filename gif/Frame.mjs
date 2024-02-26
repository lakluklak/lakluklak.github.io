import LZWOutputIndexStream from './LZWOutputIndexStream.mjs';

export class Frame {
    /**
     * @param {GIF} gif
     * @param {number} index
     * @param {number} x
     * @param {number} y
     * @param {number} width
     * @param {number} height
     * @param {boolean} hasLocalPalette
     * @param {?number} paletteOffset
     * @param {?number} paletteSize
     * @param {number} dataOffset
     * @param {number} dataLength
     * @param {?number} transparentIndex
     * @param {boolean} interlaced
     * @param {number} delay
     * @param {number} disposal
     */
    constructor(
        gif,
        index,
        x,
        y,
        width,
        height,
        delay,
        disposal,
        interlaced,
        transparentIndex,
        dataOffset,
        dataLength,
        hasLocalPalette,
        paletteOffset,
        paletteSize,
    ) {
        {
            this.#gif = gif;
            this.index = index;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.delay = delay;
            this.disposal = disposal;
            this.hasLocalPalette = hasLocalPalette;
            this.paletteOffset = paletteOffset;
            this.paletteSize = paletteSize;
            this.dataOffset = dataOffset;
            this.dataLength = dataLength;
            this.transparentIndex = transparentIndex;
            this.interlaced = interlaced;

            const gw = this.#gif.width;
            const gh = this.#gif.height;
            this.#imageData = new ImageData(gw, gh);
            this.imageDataFrame = new ImageData(gw, gh);
        }
    }

    /** @type {GIF} */ #gif;

    /** @type {ImageData} */ #imageData;
    #imageDataComplete = false;

    /** @type {ImageData} */ imageDataFrame;

    /** @return {ImageData} */
    get imageData() {
        if (this.#imageDataComplete) {
            return this.#imageData;
        }
        this.#imageDataComplete = true;

        if (this.index > 0) {
            // http://www.theimage.com/animation/pages/disposal2.html
            // http://www.theimage.com/animation/pages/disposal3.html
            // https://docstore.mik.ua/orelly/web2/wdesign/ch23_05.htm
            let prev = this.#gif.frames[this.index - 1];
            switch (prev.disposal) {
                case 1:
                    this.imageDataFrame.data.set(prev.imageDataFrame.data);
                    break;
                case 3:
                    for (let i = this.index - 1; i >= 0; i--) {
                        const f = this.#gif.frames[i];
                        if (f.disposal !== 3) {
                            this.imageDataFrame.data.set(f.imageDataFrame.data);
                            break;
                        }
                    }
                    break;
            }
        }

        const gw = this.#gif.width;

        let imageDataArray = new Uint8Array(this.width * this.height);  // At most 8-bit indices.

        LZWOutputIndexStream(this.#gif.buffer, this.dataOffset, imageDataArray, imageDataArray.length);
        const palette_offset = this.paletteOffset;

        // It seems to be much faster to compare index to 256 than
        // to === null.  Not sure why, but CompareStub_EQ_STRICT shows up high in
        // the profile, not sure if it's related to using a Uint8Array.
        const trans = this.transparentIndex ?? 256;

        // We are possibly just blitting to a portion of the entire frame.
        // That is a subrect within the framerect, so the additional pixels
        // must be skipped over after we finished a scanline.
        const framewidth = this.width;
        const framestride = gw - framewidth;
        let xleft = framewidth;  // Number of subrect pixels left in scanline.

        // Output index of the top left corner of the subrect.
        const opbeg = (this.y * gw + this.x) * 4;
        // Output index of what would be the left edge of the subrect, one row
        // below it, i.e. the index at which an interlace pass should wrap.
        const opend = ((this.y + this.height) * gw + this.x) * 4;
        let op = opbeg;

        let scanstride = framestride * 4;

        // Use scanstride to skip past the rows when interlacing.  This is skipping
        // 7 rows for the first two passes, then 3 then 1.
        if (this.interlaced === true) {
            scanstride += gw * 4 * 7;  // Pass 1.
        }

        let interlaceskip = 8;  // Tracking the row interval in the current pass.

        for (let i = 0, il = imageDataArray.length; i < il; ++i) {
            const index = imageDataArray[i];

            if (xleft === 0) {  // Beginning of new scan line
                op += scanstride;
                xleft = framewidth;
                if (op >= opend) { // Catch the wrap to switch passes when interlacing.
                    scanstride = framestride * 4 + gw * 4 * (interlaceskip - 1);
                    // interlaceskip / 2 * 4 is interlaceskip << 1.
                    op = opbeg + (framewidth + framestride) * (interlaceskip << 1);
                    interlaceskip >>= 1;
                }
            }

            if (index === trans) {
                op += 4;
            } else {
                const r = this.#gif.buffer[palette_offset + index * 3];
                const g = this.#gif.buffer[palette_offset + index * 3 + 1];
                const b = this.#gif.buffer[palette_offset + index * 3 + 2];
                const da = this.#imageData.data;
                const db = this.imageDataFrame.data;
                da[op++] = r;
                da[op++] = g;
                da[op++] = b;
                da[op++] = 255;

                db[op - 4] = r;
                db[op - 3] = g;
                db[op - 2] = b;
                db[op - 1] = 255;
            }
            --xleft;
        }

        imageDataArray = null;

        return this.#imageData;
    }

    /** @return {string} */
    get disposalName() {
        switch (this.disposal) {
            case 0:
                // No disposal specified. The decoder is not required to take any action.
                return 'unspecified';
            case 1:
                // Do not dispose. The graphic is to be left in place.
                return 'not-dispose';
            case 2:
                // Restore to background color. The area used by the graphic must be restored to the background color.
                // Dispose background doesn't really work, apparently most browsers ignore the background palette index and clear to transparency.
                return 'restore-background';
            case 3:
                // Restore to previous. The decoder is required to restore the area overwritten by the graphic with what was there prior to rendering the graphic.
                return 'restore-previous';
            case 4:
            case 5:
            case 6:
            case 7:
                // To be defined.
                return 'reserved';
            default:
                return 'broken';
        }
    }

}
