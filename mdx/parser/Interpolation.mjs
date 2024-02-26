/** @module MDX */
import {Uint32} from './Uint.mjs';
import {Parser} from './Parser.mjs';
import {Dec2RawLE} from '../../rawcode/convert.mjs';

export class Interpolation {

    /**
     * @param {number} id
     * @param child
     * @param {*?} count
     */
    constructor(id, child, count) {
        this.id = id;
        this.child = child;
        this.count = count;
    }

    items = [];

    /** @param {CDataView} view */
    read(view) {
        const id = view.uint32;
        this.length = view.uint32;
        if (id !== this.id) {
            throw new Error(`Interpolation wrong id: ${Dec2RawLE(this.id)} != ${Dec2RawLE(id)}`);
        }

        this.parser = new Parser();
        this.type = this.parser.add(Uint32);
        this.globalSequenceId = this.parser.add(Uint32);
        this.parser.read(view);

        for (let i = 0; i < this.length; i++) {
            const p = new InterpolationTrack(this);
            this.items.push(p);
            p.read(view);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.id;
        view.uint32 = this.items.length;

        this.parser.write(view);
        for (const p of this.items) {
            p.write(view);
        }
    }

    toJSON() {
        return {
            id: Dec2RawLE(this.id),
            length: this.length,
            type: this.type,
            items: this.items,
            globalSequenceId: this.globalSequenceId,
        };
    }
}

export class InterpolationTrack {

    /** @param {Interpolation} parent */
    constructor(parent) {
        this.parent = parent;
    }

    /** @param {CDataView} view */
    read(view) {
        this.time = view.uint32;
        this.value = new this.parent.child(this.parent.count);
        this.value.read(view);

        if (this.parent.type.value > 1) {
            this.inTan = new this.parent.child(this.parent.count);
            this.inTan.read(view);

            this.outTan = new this.parent.child(this.parent.count);
            this.inTan.read(view);
        }
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.time;
        this.value.write(view);
        this.inTan?.write(view);
        this.outTan?.write(view);
    }

    toJSON() {
        return {
            time: this.time,
            value: this.value,
            inTan: this.inTan,
            outTan: this.outTan,
        };
    }
}
