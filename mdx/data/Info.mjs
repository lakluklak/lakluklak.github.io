/** @module MDX */
import {Char} from "../parser/Char.mjs";
import {Parser} from "../parser/Parser.mjs";

export class Info {

	/** @param {DataView} view */
	read(view) {
		this.parser = new Parser();

		this.info = this.parser.add(new Char(view.byteLength));

		this.parser.read(view);
	}

	toJSON() {
		return this.info.toJSON()
	}
}