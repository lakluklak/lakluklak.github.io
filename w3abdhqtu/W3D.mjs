import {W3ABDHQTU} from './abstract/W3ABDHQTU.mjs';
import W3DTOMLMap from './maps/w3d/W3DTOMLMap.mjs';

export class W3D extends W3ABDHQTU {
    /** @param {Buffer|ArrayBuffer} buffer */
    constructor(buffer) {
        super(buffer, true);
    }

    /**
     * @param {string} json
     * @return {W3D}
     */
    static fromJSON(json) {
        return super._fromJSON(new W3D(new ArrayBuffer(0)), json, true);
    }

    /**
     * @param {string} ini
     * @return {W3D}
     */
    static fromTOML(ini) {
        return super._fromTOML(new W3D(new ArrayBuffer(0)), ini, true, W3DTOMLMap);
    }

    /** @return {string} */
    toTOML() {
        return super._toTOML(W3DTOMLMap, {forceType: false});
    }
}