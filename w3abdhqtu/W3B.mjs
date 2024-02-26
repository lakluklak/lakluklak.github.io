import {W3ABDHQTU} from './abstract/W3ABDHQTU.mjs';
import W3BTOMLMap from './maps/w3b/W3BTOMLMap.mjs';

export class W3B extends W3ABDHQTU {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        super(buffer, false);
    }

    /**
     * @param {string} json
     * @return {W3B}
     */
    static fromJSON(json) {
        return super._fromJSON(new W3B(new ArrayBuffer(0)), json, false);
    }

    /**
     * @param {string} ini
     * @return {W3B}
     */
    static fromTOML(ini) {
        return super._fromTOML(new W3B(new ArrayBuffer(0)), ini, false, W3BTOMLMap);
    }

    /** @return {string} */
    toTOML() {
        return super._toTOML(W3BTOMLMap, {forceType: false});
    }
}