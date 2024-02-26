/** @module MDX */

import {Interpolation} from "../parser/Interpolation.mjs";
import {Float32List} from "../parser/Float.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class TextureAnimation {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.translations = this.parser.add(new Interpolation(Chunk.KTAT, Float32List, 3));
		this.rotations = this.parser.add(new Interpolation(Chunk.KTAR, Float32List, 4));
		this.scalings = this.parser.add(new Interpolation(Chunk.KTAS, Float32List, 3));

		this.parser.read(view);
	}

	toJSON() {
		return {
			translations: this.translations,
			rotations: this.rotations,
			scalings: this.scalings,
		}
	}
}
