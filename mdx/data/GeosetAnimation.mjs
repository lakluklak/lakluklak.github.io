/** @module MDX */

import {Float32, Float32List} from "../parser/Float.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class GeosetAnimation {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.alpha = this.parser.add(Float32);
		this.flags = this.parser.add(Uint32);
		this.color = this.parser.add(new Float32List(3));
		this.geosetId = this.parser.add(Uint32);
		this.alphaTrack = this.parser.add(new Interpolation(Chunk.KGAO, Float32));
		this.colorTrack = this.parser.add(new Interpolation(Chunk.KGAC, Float32List, 3));

		this.parser.read(view);
	}

	toJSON() {
		return {
			alpha: this.alpha,
			flags: this.flags,
			color: this.color,
			geosetId: this.geosetId,
			alphaTrack: this.alphaTrack,
			colorTrack: this.colorTrack,
		}
	}
}
