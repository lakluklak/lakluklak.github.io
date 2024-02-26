/** @module MDX */

import {NodeData} from "./NodeData.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Parser} from "../parser/Parser.mjs";

export class Bone {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.node = this.parser.add(NodeData);
		this.geosetId = this.parser.add(Uint32);
		this.geosetAnimationId = this.parser.add(Uint32);

		this.parser.read(view);
	}

	toJSON() {
		return {
			node: this.node,
			geosetId: this.geosetId,
			geosetAnimationId: this.geosetAnimationId,
		}
	}
}
