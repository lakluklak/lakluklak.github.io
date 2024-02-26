/** @module MDX */

export class Parser {

	/** @param {Vers?} vers */
	constructor(vers) {
		this.vers = vers;
	}

	items = [];

	_read = [];

	add(item) {
		const p = typeof item === 'object' ? item : new item();
		this._read.push(p);
		return p;
	}

	/** @param {DataView} view */
	read(view) {
		while (this._read.length > 0) {
			const p = this._read.shift();
			if (p.id) {
				p.vers = this.vers;
				const map = new Map();
				map.set(p.id, p);
				while (this._read.length > 0) {
					const p = this._read.shift();
					p.vers = this.vers;
					if (p.id) {
						map.set(p.id, p);
					} else {
						this._read.unshift(p);
						break;
					}
				}
				while (view.cursor < view.byteLength - 4) {
					const key = view.getUint32(view.cursor, true);
					if (map.has(key)) {
						const p = map.get(key);
						map.delete(key);
						this.items.push(p);
						p.read(view);
					} else {
						break;
					}
				}
				continue;
			}
			this.items.push(p);
			p.read(view);
		}
	}

	/** @param {DataView} view */
	write(view) {
		for (const i of this.items) {
			(i.write ? i : i.parser).write(view);
		}
	}
}