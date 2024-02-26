/** @module MDX */

import {Uint32} from '../parser/Uint.mjs';
import {Float32, Float32List} from '../parser/Float.mjs';
import {Parser} from '../parser/Parser.mjs';
import {Interpolation} from '../parser/Interpolation.mjs';
import {Chunk} from '../parser/Chunk.mjs';

export class Layer {

    /** @type {Vers} */ vers;

    /** @param {DataView} view */
    read(view) {
        this.parser = new Parser();

        this.filterMode = this.parser.add(Uint32);
        this.shadingFlags = this.parser.add(Uint32);
        this.textureId = this.parser.add(Uint32);
        this.textureAnimationId = this.parser.add(Uint32);
        this.coordId = this.parser.add(Uint32);
        this.alpha = this.parser.add(Float32);

        if (this.vers.version > 800) {
            this.emissiveGain = this.parser.add(Float32);
            this.fresnelColor = this.parser.add(new Float32List(3));
            this.fresnelOpacity = this.parser.add(Float32);
            this.fresnelTeamColor = this.parser.add(Float32);
        }

        if (this.vers.version >= 1100) {
            this.parser.add(ShaderType);
        }

        if (this.vers.version > 800) {
            this.emissiveGainTrack = this.parser.add(new Interpolation(Chunk.KMTE, Float32));
        }

        this.textureIdTrack = this.parser.add(new Interpolation(Chunk.KMTF, Uint32));
        this.alphaTrack = this.parser.add(new Interpolation(Chunk.KMTA, Float32));

        if (this.vers.version > 900) {
            this.fresnelColorTrack = this.parser.add(new Interpolation(Chunk.KFC3, Float32List, 3));
            this.fresnelAlphaTrack = this.parser.add(new Interpolation(Chunk.KFCA, Float32));
            this.fresnelTeamColorTrack = this.parser.add(new Interpolation(Chunk.KFTC, Float32));
        }

        this.parser.read(view);
    }

    toJSON() {
        return {
            filterMode: this.filterMode,
            shadingFlags: this.shadingFlags,
            textureId: this.textureId,
            textureIdTrack: this.textureIdTrack,
            textureAnimationId: this.textureAnimationId,
            coordId: this.coordId,
            alpha: this.alpha,
            alphaTrack: this.alphaTrack,
            emissiveGain: this.emissiveGain,
            fresnelColor: this.fresnelColor,
            fresnelOpacity: this.fresnelOpacity,
            fresnelTeamColor: this.fresnelTeamColor,
            emissiveGainTrack: this.emissiveGainTrack,
            fresnelColorTrack: this.fresnelColorTrack,
            fresnelAlphaTrack: this.fresnelAlphaTrack,
            fresnelTeamColorTrack: this.fresnelTeamColorTrack,
        };
    }
}


class ShaderType {

    /** @param {CDataView} view */
    read(view) {
        this.shaderTypeId = view.uint32;
        this.textureIdCount = view.uint32;

        for (let i = 0; i < this.textureIdCount; i++) {
            this.texture.push(view.uint32);
            this.texture.push(view.uint32);
        }
    }

    texture = [];

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.shaderTypeId;
        view.uint32 = this.textureIdCount;
        for (const t of this.texture) {
            view.uint32 = t;
        }
    }
}