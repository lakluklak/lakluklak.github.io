/** @extends CDataView */
export class CDataViewFake {
    cursor = 0;

    setUint8(_, __) {
    }

    set uint8(_) {
        this.cursor += 1;
    }

    setUint16(_, __, ___) {
    }

    set uint16(_) {
        this.cursor += 2;
    }

    setUint32(_, __, ___) {
    }

    set uint32(_) {
        this.cursor += 4;
    }

    set uint32BE(_) {
        this.cursor += 4;
    }

    setFloat32(_, __, ___) {
    }

    set float32(_) {
        this.cursor += 4;
    }

    set string(s) {
        this.cursor += new TextEncoder().encode(s).length + 1;
    }

    getStringFixed(_) {
    }

    setStringFixed(_, length) {
        this.cursor += length;
    }

    get sizeOffset() {
        this.cursor += 4;
        return this.cursor - 4;
    }

    set sizeOffsetInclusive(_) {
    }

    set sizeOffsetExclusive(_) {
    }

}