/** @module MDX */

import {Uint32} from '../parser/Uint.mjs';
import {Char} from '../parser/Char.mjs';
import {Parser} from '../parser/Parser.mjs';
import {Chunk} from '../parser/Chunk.mjs';
import {Layer} from './Layer.mjs';
import {CDataView} from '../../utils/c-data-view.mjs';
import {Dec2RawLE} from '../../rawcode/convert.mjs';

export class Material {

    /** @type {Vers} */ vers;

    /** @param {DataView} view */
    read(view) {
        this.parser = new Parser(this.vers);

        this.priorityPlane = this.parser.add(Uint32);
        this.flags = this.parser.add(Uint32);

        if (this.vers.version > 800 && this.vers.version < 1100) {
            this.shader = this.parser.add(new Char(80));
        }

        this.layers = this.parser.add(new MaterialChunk(Chunk.LAYS, Layer));

        this.parser.read(view);
    }

    toJSON() {
        return {
            priorityPlane: this.priorityPlane,
            flags: this.flags,
            shader: this.shader,
            layers: this.layers,
        };
    }
}

class MaterialChunk {

    /** @type {Vers} */ vers;

    constructor(id, child) {
        this.id = id;
        this.child = child;
    }

    items = [];

    /** @param {CDataView} view */
    read(view) {
        const id = view.uint32;
        if (id !== this.id) {
            throw new Error(`ChunkCountInclusive wrong id: ${Dec2RawLE(this.id)} != ${Dec2RawLE(id)}`);
        }
        const count = view.uint32;
        for (let i = 0; i < count; i++) {
            const size = view.uint32 - 4;

            if (size <= 0) {
                throw new Error('ChunkCountInclusive size is 0!');
            }
            if (view.cursor + size > view.byteLength) {
                throw new Error(`ChunkCountInclusive out of range: ${view.cursor + size} > ${view.byteLength}`);
            }

            const parser = new this.child();
            parser.vers = this.vers;
            this.items.push(parser);
            parser.read(new CDataView(view.buffer, view.byteOffset + view.cursor, size));

            view.cursor += size;
        }
        if (view.cursor !== view.byteLength) {
            throw new Error('ChunkCountInclusive inclusive wrong count!');
        }
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.id;
        view.uint32 = this.items.length;
        for (const i of this.items) {
            const so = view.sizeOffset;
            (i.write ? i : i.parser).write(view);
            view.sizeOffsetInclusive = so;
        }
    }
}