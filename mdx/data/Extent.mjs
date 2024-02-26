import {Float32, Float32List} from "../parser/Float.mjs";
import {Parser} from "../parser/Parser.mjs";

/** @module MDX */
export class Extent {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.boundsRadius = this.parser.add(Float32);
		this.minimum = this.parser.add(new Float32List(3));
		this.maximum = this.parser.add(new Float32List(3));

		this.parser.read(view);
	}

	toJSON() {
		return {
			boundsRadius: this.boundsRadius,
			minimum: this.minimum,
			maximum: this.maximum,
		};
	}
}
