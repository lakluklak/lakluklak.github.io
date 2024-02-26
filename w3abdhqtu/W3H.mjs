import {W3ABDHQTU} from './abstract/W3ABDHQTU.mjs';
import W3HTOMLMap from './maps/w3h/W3HTOMLMap.mjs';

export class W3H extends W3ABDHQTU {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        super(buffer, false);
    }

    /**
     * @param {string} json
     * @return {W3H}
     */
    static fromJSON(json) {
        return super._fromJSON(new W3H(new ArrayBuffer(0)), json, false);
    }

    /**
     * @param {string} ini
     * @return {W3H}
     */
    static fromTOML(ini) {
        return super._fromTOML(new W3H(new ArrayBuffer(0)), ini, false, W3HTOMLMap);
    }

    /** @return {string} */
    toTOML() {
        return super._toTOML(W3HTOMLMap, {forceType: false});
    }
}