/** @module MDX */
import {NodeData} from "./NodeData.mjs";
import {Uint32} from "../parser/Uint.mjs";
import {Float32, Float32List} from "../parser/Float.mjs";
import {Interpolation} from "../parser/Interpolation.mjs";
import {Parser} from "../parser/Parser.mjs";
import {Chunk} from "../parser/Chunk.mjs";

export class Light {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.node = this.parser.add(NodeData);
		this.type = this.parser.add(Uint32);
		this.attenuationStart = this.parser.add(Uint32);
		this.attenuationEnd = this.parser.add(Uint32);
		this.color = this.parser.add(new Float32List(3));
		this.intensity = this.parser.add(Float32);
		this.ambientColor = this.parser.add(new Float32List(3));
		this.ambientIntensity = this.parser.add(Float32);
		this.attenuationStartTrack = this.parser.add(new Interpolation(Chunk.KLAS, Float32));
		this.attenuationEndTrack = this.parser.add(new Interpolation(Chunk.KLAE, Float32));
		this.colorTrack = this.parser.add(new Interpolation(Chunk.KLAC, Float32List, 3));
		this.intensityTrack = this.parser.add(new Interpolation(Chunk.KLAI, Float32));
		this.ambientColorTrack = this.parser.add(new Interpolation(Chunk.KLBC, Float32List, 3));
		this.ambientIntensityTrack = this.parser.add(new Interpolation(Chunk.KLBI, Float32));
		this.visibilityTrack = this.parser.add(new Interpolation(Chunk.KLAV, Float32));

		this.parser.read(view);
	}

	toJSON() {
		return {
			node: this.node,
			type: this.type,
			attenuationStart: this.attenuationStart,
			attenuationStartTrack: this.attenuationStartTrack,
			attenuationEnd: this.attenuationEnd,
			attenuationEndTrack: this.attenuationEndTrack,
			color: this.color,
			colorTrack: this.colorTrack,
			intensity: this.intensity,
			intensityTrack: this.intensityTrack,
			ambientColor: this.ambientColor,
			ambientColorTrack: this.ambientColorTrack,
			ambientIntensity: this.ambientIntensity,
			ambientIntensityTrack: this.ambientIntensityTrack,
			visibilityTrack: this.visibilityTrack,
		}
	}
}