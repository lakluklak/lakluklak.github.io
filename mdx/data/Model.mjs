/** @module MDX */

import {Char} from "../parser/Char.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Float32, Float32List} from "../parser/Float.mjs";
import {Uint32} from "../parser/Uint.mjs";

export class Model {

	/** @param {DataView} view */
	read(view) {

		this.parser = new Parser();
		this.name = this.parser.add(new Char(80));
		this.animationFileName = this.parser.add(new Char(260));
		this.boundsRadius = this.parser.add(Float32);
		this.minimumExtent = this.parser.add(new Float32List(3));
		this.maximumExtent = this.parser.add(new Float32List(3));
		this.blendTime = this.parser.add(Uint32);

		this.parser.read(view);
	}

	toJSON() {
		return {
			name: this.name,
			animationFileName: this.animationFileName,
			boundsRadius: this.boundsRadius,
			minimumExtent: this.minimumExtent,
			maximumExtent: this.maximumExtent,
			blendTime: this.blendTime,
		}
	}
}
