import {W3ABDHQTU} from './abstract/W3ABDHQTU.mjs';
import W3ATOMLMap from './maps/w3a/W3ATOMLMap.mjs';

export class W3A extends W3ABDHQTU {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        super(buffer, true);
    }

    /**
     * @param {string} json
     * @return {W3A}
     */
    static fromJSON(json) {
        return super._fromJSON(new W3A(new ArrayBuffer(0)), json, true);
    }

    /**
     * @param {string} ini
     * @return {W3A}
     */
    static fromTOML(ini) {
        return super._fromTOML(new W3A(new ArrayBuffer(0)), ini, true, W3ATOMLMap);
    }

    /** @return {string} */
    toTOML() {
        return super._toTOML(W3ATOMLMap, {endblock: false});
    }
}