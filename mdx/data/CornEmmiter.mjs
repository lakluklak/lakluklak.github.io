/** @module MDX */
import {NodeData} from "./NodeData.mjs";
import {Float32, Float32List} from "../parser/Float.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Char} from "../parser/Char.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class CornEmmiter {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.node = this.parser.add(NodeData);
		this.lifeSpan = this.parser.add(Float32);
		this.emissionRate = this.parser.add(Float32);
		this.speed = this.parser.add(Float32);
		this.color = this.parser.add(new Float32List(4));
		this.replaceableId = this.parser.add(Uint32);
		this.path = this.parser.add(new Char(260));
		this.flags = this.parser.add(new Char(260));
		this.alphaTrack = this.parser.add(new Interpolation(Chunk.KPPA, Float32));
		this.colorTrack = this.parser.add(new Interpolation(Chunk.KPPC, Float32List, 3));
		this.emissionRateTrack = this.parser.add(new Interpolation(Chunk.KPPE, Float32));
		this.lifespanTrack = this.parser.add(new Interpolation(Chunk.KPPL, Float32));
		this.speedTrack = this.parser.add(new Interpolation(Chunk.KPPS, Float32));
		this.visibilityTrack = this.parser.add(new Interpolation(Chunk.KPPV, Float32));

		this.parser.read(view);
	}

	toJSON() {
		return {
			node: this.node,
			lifeSpan: this.lifeSpan,
			emissionRate: this.emissionRate,
			speed: this.speed,
			color: this.color,
			replaceableId: this.replaceableId,
			path: this.path,
			flags: this.flags,
			alphaTrack: this.alphaTrack,
			colorTrack: this.colorTrack,
			emissionRateTrack: this.emissionRateTrack,
			lifespanTrack: this.lifespanTrack,
			speedTrack: this.speedTrack,
			visibilityTrack: this.visibilityTrack,
		}
	}
}
