/** @module MDX */

import {NodeData} from "./NodeData.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Float32List} from "../parser/Float.mjs";
import {Parser} from "../parser/Parser.mjs";

export class CollisionShape {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.node = this.parser.add(NodeData);
		this.type = this.parser.add(Uint32);

		this.parser.read(view);

		const t = this.type.value;

		const l = t === 2 ? 1 : 2;
		for (let i = 0; i < 3; i++) {
			this.vertices.push(this.parser.add(new Float32List(l)));
		}

		if (t === 2 || t === 3) {
			this.radius = this.parser.add(Uint32);
		}

		this.parser.read(view);
	}

	/** @type {Float32List[]} */ vertices = [];

	toJSON() {
		return {
			node: this.node,
			type: this.type,
			radius: this.radius,
		}
	}
}
