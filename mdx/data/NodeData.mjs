/** @module MDX */

import {Char} from "../parser/Char.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Float32List} from "../parser/Float.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class NodeData {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		//FIXME inclusive size DataView
		this.inclusiveSize = this.parser.add(Uint32);
		this.name = this.parser.add(new Char(80));
		this.objectId = this.parser.add(Uint32);
		this.parentId = this.parser.add(Uint32);
		this.flags = this.parser.add(Uint32);
		this.translation = this.parser.add(new Interpolation(Chunk.KGTR, Float32List, 3));
		this.scaling = this.parser.add(new Interpolation(Chunk.KGSC, Float32List, 3));
		this.rotation = this.parser.add(new Interpolation(Chunk.KGRT, Float32List, 4));

		this.parser.read(view);
	}

	toJSON() {
		return {
			inclusiveSize: this.inclusiveSize,
			name: this.name,
			objectId: this.objectId,
			parentId: this.parentId,
			flags: this.flags,
			translation: this.translation,
			rotation: this.rotation,
			scaling: this.scaling,
		}
	}
}