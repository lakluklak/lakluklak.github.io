/** @module MDX */

import {NodeData} from "./NodeData.mjs";
import {Float32} from "../parser/Float.mjs";
import {Char} from "../parser/Char.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class ParticleEmitter {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.node = this.parser.add(NodeData);
		this.emissionRate = this.parser.add(Float32);
		this.gravity = this.parser.add(Float32);
		this.longitude = this.parser.add(Float32);
		this.latitude = this.parser.add(Float32);
		this.spawnModelFileName = this.parser.add(new Char(260));
		this.lifeSpan = this.parser.add(Float32);
		this.initialVelocity = this.parser.add(Float32);
		this.emissionRateTrack = this.parser.add(new Interpolation(Chunk.KPEE, Float32));
		this.gravityTrack = this.parser.add(new Interpolation(Chunk.KPEG, Float32));
		this.longitudeTrack = this.parser.add(new Interpolation(Chunk.KPLN, Float32));
		this.latitudeTrack = this.parser.add(new Interpolation(Chunk.KPLT, Float32));
		this.lifeSpanTrack = this.parser.add(new Interpolation(Chunk.KPEL, Float32));
		this.speedTrack = this.parser.add(new Interpolation(Chunk.KPES, Float32));
		this.visibilityTrack = this.parser.add(new Interpolation(Chunk.KPEV, Float32));

		this.parser.read(view);
	}

	toJSON() {
		return {
			node: this.node,
			emissionRate: this.emissionRate,
			emissionRateTrack: this.emissionRateTrack,
			gravity: this.gravity,
			gravityTrack: this.gravityTrack,
			longitude: this.longitude,
			longitudeTrack: this.longitudeTrack,
			latitude: this.latitude,
			latitudeTrack: this.latitudeTrack,
			spawnModelFileName: this.spawnModelFileName,
			lifeSpan: this.lifeSpan,
			lifeSpanTrack: this.lifeSpanTrack,
			initialVelocity: this.initialVelocity,
			speedTrack: this.speedTrack,
			visibilityTrack: this.visibilityTrack,
		}
	}
}
