/** @module MDX */

import {Float32List} from "../parser/Float.mjs";
import {Parser} from "../parser/Parser.mjs";

export class PivotPoint {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();
		this.point = this.parser.add(new Float32List(3));
		this.parser.read(view);
	}

	toJSON() {
		return this.point.toJSON();
	}
}