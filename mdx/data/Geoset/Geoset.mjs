/** @module MDX */

import {Uint16, Uint32, Uint8} from '../../parser/Uint.mjs';
import {Char} from '../../parser/Char.mjs';
import {Extent} from '../Extent.mjs';
import {Float32} from '../../parser/Float.mjs';
import {Parser} from '../../parser/Parser.mjs';
import {Chunk} from '../../parser/Chunk.mjs';
import {Dec2RawLE} from '../../../rawcode/convert.mjs';

export class Geoset {

    /** @type {Vers} */ vers;

    #textureCoordinateSets;

    get textureCoordinateSets() {
        return this.#textureCoordinateSets?.items[0]?.items;
    }

    /** @param {DataView} view */
    read(view) {
        this.parser = new Parser();

        this.vertexPositions = this.parser.add(new GeosetChunk(Chunk.VRTX, Float32, 3));
        this.vertexNormals = this.parser.add(new GeosetChunk(Chunk.NRMS, Float32, 3));
        this.faceTypeGroups = this.parser.add(new GeosetChunk(Chunk.PTYP, Uint32));
        this.faceGroups = this.parser.add(new GeosetChunk(Chunk.PCNT, Uint32));
        this.faces = this.parser.add(new GeosetChunk(Chunk.PVTX, Uint16));
        this.vertexGroups = this.parser.add(new GeosetChunk(Chunk.GNDX, Uint8));
        this.matrixGroups = this.parser.add(new GeosetChunk(Chunk.MTGC, Uint32));
        this.matrixIndices = this.parser.add(new GeosetChunk(Chunk.MATS, Uint32));
        this.materialId = this.parser.add(Uint32);
        this.selectionGroup = this.parser.add(Uint32);
        this.selectionFlags = this.parser.add(Uint32);
        if (this.vers.version > 800) {
            this.lod = this.parser.add(Uint32);
            this.lodName = this.parser.add(new Char(80));
        }
        this.parser.add(Extent);
        this.sequenceExtents = this.parser.add(new GeosetChunk(null, Extent));
        if (this.vers.version > 800) {
            this.tangents = this.parser.add(new GeosetChunk(Chunk.TANG, Float32, 4, true));
            this.skins = this.parser.add(new GeosetChunk(Chunk.SKIN, Uint8, 1, true));
        }
        this.#textureCoordinateSets = this.parser.add(new GeosetChunk(Chunk.UVAS, new GeosetChunk(Chunk.UVBS, Float32, 2)));

        this.parser.read(view);
    }

    toJSON() {
        return {
            vertexPositions: this.vertexPositions,
            vertexNormals: this.vertexNormals,
            faceTypeGroups: this.faceTypeGroups,
            faceGroups: this.faceGroups,
            faces: this.faces,
            vertexGroups: this.vertexGroups,
            matrixGroups: this.matrixGroups,
            matrixIndices: this.matrixIndices,
            materialId: this.materialId,
            selectionGroup: this.selectionGroup,
            selectionFlags: this.selectionFlags,
            lod: this.lod,
            lodName: this.lodName,
            sequenceExtents: this.sequenceExtents,
            tangents: this.tangents,
            skins: this.skins,
            textureCoordinateSets: this.textureCoordinateSets,
        };
    }
}

class GeosetChunk {
    /**
     * @param {?number} key
     * @param child
     * @param {number} lx
     * @param {boolean} any
     */
    constructor(key, child, lx = 1, any = false) {
        this.key = key;
        any && (this.id = key);
        this.child = child.copy ? child.copy() : child;
        this.#lx = lx;
    }

    /** @type {number} */ #lx;

    copy() {
        return new this.constructor(this.key, this.child, this.#lx);
    }

    items = [];

    /** @param {CDataView} view */
    read(view) {
        if (this.key) {
            const id = view.uint32;
            if (id !== this.key) {
                throw new Error(`ChunkCountInclusive wrong id: ${Dec2RawLE(this.key)} != ${Dec2RawLE(id)}`);
            }
        }
        this.length = view.uint32 * this.#lx;

        for (let i = 0; i < this.length; i++) {
            const p = typeof this.child === 'object' ? this.child : new this.child();
            this.items.push(p);
            p.read(view);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        if (this.key) view.uint32 = this.key;
        view.uint32 = this.items.length / this.#lx;

        for (const i of this.items) {
            (i.write ? i : i.parser).write(view);
        }
    }

    toJSON() {
        return {
            length: this.length,
            items: this.items,
        };
    };
}
