import {W3ABDHQTU} from './abstract/W3ABDHQTU.mjs';
import W3QTOMLMap from './maps/w3q/W3QTOMLMap.mjs';

export class W3Q extends W3ABDHQTU {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        super(buffer, true);
    }

    /**
     * @param {string} json
     * @return {W3Q}
     */
    static fromJSON(json) {
        return super._fromJSON(new W3Q(new ArrayBuffer(0)), json, true);
    }

    /**
     * @param {string} ini
     * @return {W3Q}
     */
    static fromTOML(ini) {
        return super._fromTOML(new W3Q(new ArrayBuffer(0)), ini, true, W3QTOMLMap);
    }

    /** @return {string} */
    toTOML() {
        return super._toTOML(W3QTOMLMap, {endblock: false});
    }
}