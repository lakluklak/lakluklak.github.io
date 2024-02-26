/** @module MDX */
import {Char} from "../parser/Char.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Float32, Float32List} from "../parser/Float.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class Camera {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.name = this.parser.add(new Char(80));
		this.position = this.parser.add(new Float32List(3));
		this.fieldOfView = this.parser.add(new Uint32());
		this.farClippingPlane = this.parser.add(new Uint32());
		this.nearClippingPlane = this.parser.add(new Uint32());
		this.targetPosition = this.parser.add(new Float32List(3));
		this.rotation = this.parser.add(new Interpolation(Chunk.KCRL, Float32));
		this.translation = this.parser.add(new Interpolation(Chunk.KCTR, Float32List, 3));
		this.targetTranslation = this.parser.add(new Interpolation(Chunk.KTTR, Float32List, 3));

		this.parser.read(view);
	}

	toJSON() {
		return {
			name: this.name,
			position: this.position,
			fieldOfView: this.fieldOfView,
			farClippingPlane: this.farClippingPlane,
			nearClippingPlane: this.nearClippingPlane,
			targetPosition: this.targetPosition,
			translation: this.translation,
			targetTranslation: this.targetTranslation,
			rotation: this.rotation,
		}
	}
}