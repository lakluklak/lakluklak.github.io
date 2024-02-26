/** @module MDX */

import {NodeData} from "./NodeData.mjs";
import {Float32, Float32List} from "../parser/Float.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class RibbonEmitter {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.node = this.parser.add(NodeData);
		this.heightAbove = this.parser.add(Float32);
		this.heightBelow = this.parser.add(Float32);
		this.alpha = this.parser.add(Float32);
		this.color = this.parser.add(new Float32List(3));
		this.lifeSpan = this.parser.add(Float32);
		this.textureSlot = this.parser.add(Uint32);
		this.emissionRate = this.parser.add(Uint32);
		this.rows = this.parser.add(Uint32);
		this.columns = this.parser.add(Uint32);
		this.materialId = this.parser.add(Uint32);
		this.gravity = this.parser.add(Float32);
		this.alphaTrack = this.parser.add(new Interpolation(Chunk.KRAL, Float32));
		this.colorTrack = this.parser.add(new Interpolation(Chunk.KRCO, Float32List, 3));
		this.textureSlotTrack = this.parser.add(new Interpolation(Chunk.KRTX, Uint32));
		this.visibility = this.parser.add(new Interpolation(Chunk.KRVS, Float32));
		this.heightAboveStruct = this.parser.add(new Interpolation(Chunk.KRHA, Float32));
		this.heightBelowStruct = this.parser.add(new Interpolation(Chunk.KRHB, Float32));

		this.parser.read(view);
	}

	toJSON() {
		return {
			node: this.node,
			heightAbove: this.heightAbove,
			heightBelow: this.heightBelow,
			alpha: this.alpha,
			alphaTrack: this.alphaTrack,
			color: this.color,
			colorTrack: this.colorTrack,
			lifeSpan: this.lifeSpan,
			textureSlot: this.textureSlot,
			textureSlotTrack: this.textureSlotTrack,
			emissionRate: this.emissionRate,
			rows: this.rows,
			columns: this.columns,
			materialId: this.materialId,
			gravity: this.gravity,
			visibility: this.visibility,
			heightAboveStruct: this.heightAboveStruct,
			heightBelowStruct: this.heightBelowStruct,
		}
	}
}