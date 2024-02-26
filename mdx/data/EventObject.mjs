/** @module MDX */

import {NodeData} from "./NodeData.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";
import {Dec2RawLE} from '../../rawcode/convert.mjs';

export class EventObject {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();
		this.node = this.parser.add(NodeData);
		this.key = this.parser.add(Uint32);

		this.count = this.parser.add(Uint32);
		this.globalSequenceId = this.parser.add(Uint32);
		this.parser.read(view);
		if (this.key.value !== Chunk.KEVT) {
			throw new Error(`EventObject key error: ${Dec2RawLE(this.key.value)} != ${Dec2RawLE(Chunk.KEVT)}`);
		}

		for (let i = 0; i < this.count.value; i++) {
			let p = new Uint32();
			this.items.push(p);
			p.read(view);
		}
	}

	items = [];

	/** @param {DataView} view */
	write(view) {
		this.parser.write(view);
		for (const p of this.items) {
			p.write(view);
		}
		//FIXME update count
		//this.reader.setUint(this.count.size, this.items.length, this.count.writeOffsetCurrent);
	}

	toJSON() {
		return {
			node: this.node,
			key: this.key,
			count: this.count,
			globalSequenceId: this.globalSequenceId,
		}
	}
}