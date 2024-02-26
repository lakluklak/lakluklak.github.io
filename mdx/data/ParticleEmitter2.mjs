/** @module MDX */

import {NodeData} from "./NodeData.mjs";
import {Float32, Float32List} from "../parser/Float.mjs";
import {Uint32, Uint8List} from "../parser/Uint.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class ParticleEmitter2 {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.node = this.parser.add(NodeData);
		this.speed = this.parser.add(Float32);
		this.variation = this.parser.add(Float32);
		this.latitude = this.parser.add(Float32);
		this.gravity = this.parser.add(Float32);
		this.lifespan = this.parser.add(Float32);
		this.emissionRate = this.parser.add(Float32);
		this.length = this.parser.add(Float32);
		this.width = this.parser.add(Float32);
		this.filterMode = this.parser.add(Uint32);
		this.rows = this.parser.add(Uint32);
		this.columns = this.parser.add(Uint32);
		this.headOrTail = this.parser.add(Uint32);
		this.tailLength = this.parser.add(Float32);
		this.time = this.parser.add(Float32);
		this.segmentColor = this.parser.add(new Float32List(9));
		this.segmentAlpha = this.parser.add(new Uint8List(3));
		this.segmentScaling = this.parser.add(new Float32List(3));
		this.headIntervalStart = this.parser.add(Uint32);
		this.headIntervalEnd = this.parser.add(Uint32);
		this.headIntervalRepeat = this.parser.add(Uint32);
		this.headDecayIntervalStart = this.parser.add(Uint32);
		this.headDecayIntervalEnd = this.parser.add(Uint32);
		this.headDecayIntervalRepeat = this.parser.add(Uint32);
		this.tailIntervalStart = this.parser.add(Uint32);
		this.tailIntervalEnd = this.parser.add(Uint32);
		this.tailIntervalRepeat = this.parser.add(Uint32);
		this.tailDecayIntervalStart = this.parser.add(Uint32);
		this.tailDecayIntervalEnd = this.parser.add(Uint32);
		this.tailDecayIntervalRepeat = this.parser.add(Uint32);
		this.textureId = this.parser.add(Uint32);
		this.squirt = this.parser.add(Uint32);
		this.priorityPlane = this.parser.add(Uint32);
		this.replaceableId = this.parser.add(Uint32);
		this.speedTrack = this.parser.add(new Interpolation(Chunk.KP2S, Float32));
		this.variationTrack = this.parser.add(new Interpolation(Chunk.KP2R, Float32));
		this.latitudeTrack = this.parser.add(new Interpolation(Chunk.KP2L, Float32));
		this.gravityTrack = this.parser.add(new Interpolation(Chunk.KP2G, Float32));
		this.emissionRateTrack = this.parser.add(new Interpolation(Chunk.KP2E, Float32));
		this.lengthTrack = this.parser.add(new Interpolation(Chunk.KP2N, Float32));
		this.widthTrack = this.parser.add(new Interpolation(Chunk.KP2W, Float32));
		this.visibilityTrack = this.parser.add(new Interpolation(Chunk.KP2V, Float32));

		this.parser.read(view);
	}

	toJSON() {
		return {
			inclusiveSize: this.inclusiveSize,
			node: this.node,
			speed: this.speed,
			variation: this.variation,
			latitude: this.latitude,
			gravity: this.gravity,
			lifespan: this.lifespan,
			emissionRate: this.emissionRate,
			length: this.length,
			width: this.width,
			filterMode: this.filterMode,
			rows: this.rows,
			columns: this.columns,
			headOrTail: this.headOrTail,
			tailLength: this.tailLength,
			time: this.time,
			segmentColor: this.segmentColor,
			segmentAlpha: this.segmentAlpha,
			segmentScaling: this.segmentScaling,
			headIntervalStart: this.headIntervalStart,
			headIntervalEnd: this.headIntervalEnd,
			headIntervalRepeat: this.headIntervalRepeat,
			headDecayIntervalStart: this.headDecayIntervalStart,
			headDecayIntervalEnd: this.headDecayIntervalEnd,
			headDecayIntervalRepeat: this.headDecayIntervalRepeat,
			tailIntervalStart: this.tailIntervalStart,
			tailIntervalEnd: this.tailIntervalEnd,
			tailIntervalRepeat: this.tailIntervalRepeat,
			tailDecayIntervalStart: this.tailDecayIntervalStart,
			tailDecayIntervalEnd: this.tailDecayIntervalEnd,
			tailDecayIntervalRepeat: this.tailDecayIntervalRepeat,
			textureId: this.textureId,
			squirt: this.squirt,
			priorityPlane: this.priorityPlane,
			replaceableId: this.replaceableId,
			speedTrack: this.speedTrack,
			variationTrack: this.variationTrack,
			latitudeTrack: this.latitudeTrack,
			gravityTrack: this.gravityTrack,
			emissionRateTrack: this.emissionRateTrack,
			lengthTrack: this.lengthTrack,
			widthTrack: this.widthTrack,
			visibilityTrack: this.visibilityTrack,
		}
	}
}
