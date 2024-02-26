import {W3ABDHQTU} from './abstract/W3ABDHQTU.mjs';
import W3UTOMLMap from './maps/w3u/W3UTOMLMap.mjs';

export class W3T extends W3ABDHQTU {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        super(buffer, false);
    }

    /**
     * @param {string} json
     * @return {W3T}
     */
    static fromJSON(json) {
        return super._fromJSON(new W3T(new ArrayBuffer(0)), json, false);
    }

    /**
     * @param {string} ini
     * @return {W3T}
     */
    static fromTOML(ini) {
        return super._fromTOML(new W3T(new ArrayBuffer(0)), ini, false, W3UTOMLMap);
    }

    /** @return {string} */
    toTOML() {
        return super._toTOML(W3UTOMLMap, {forceType: false});
    }
}