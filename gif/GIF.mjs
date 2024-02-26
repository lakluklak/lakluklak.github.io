import {Frame} from "./Frame.mjs";

export class GIF {
	/**
	 * @param {ArrayBuffer} buffer
	 */
	constructor(buffer) {
		this.buffer = new Uint8Array(buffer);
	}

	/** @type {Error[]} */
	errors = [];

	duration = 0;

	/** @type {Frame[]}} */ frames = [];

	parse() {
		try {
			this.#parse()
		} catch (e) {
			this.errors.push(e);
		}

		for (const frame of this.frames) {
			this.duration += frame.delay;
		}
	}

	#parse() {
		let p = 0;

		// - Header (GIF87a or GIF89a).
		if (this.buffer[p++] !== 0x47 || this.buffer[p++] !== 0x49 || this.buffer[p++] !== 0x46 ||
			this.buffer[p++] !== 0x38 || (this.buffer[p++] + 1 & 0xfd) !== 0x38 || this.buffer[p++] !== 0x61) {
			throw new Error("Invalid GIF 87a/89a header.");
		}

		// - Logical Screen Descriptor.
		this.width = this.buffer[p++] | this.buffer[p++] << 8;
		this.height = this.buffer[p++] | this.buffer[p++] << 8;

		const pf0 = this.buffer[p++];  // <Packed Fields>.
		const global_palette_flag = pf0 >> 7;
		const num_global_colors_pow2 = pf0 & 0x7;
		const num_global_colors = 1 << num_global_colors_pow2 + 1;
		p++; //const background = buf[p++];
		p++; //buf[p++];  // Pixel aspect ratio (unused?).

		let global_palette_offset = null;
		let global_palette_size = null;

		if (global_palette_flag) {
			global_palette_offset = p;
			global_palette_size = num_global_colors;
			p += num_global_colors * 3;  // Seek past palette.
		}

		let no_eof = true;

		let delay = 0;
		let transparent_index = null;
		let disposal = 0;

		let loop_count = null;

		while (no_eof && p < this.buffer.length) {
			switch (this.buffer[p++]) {
				case 0x21:  // Graphics Control Extension Block
					switch (this.buffer[p++]) {
						case 0xff:  // Application specific block
							// Try if it's a Netscape block (with animation loop counter).
							if (this.buffer[p] !== 0x0b ||  // 21 FF already read, check block size.
								// NETSCAPE2.0
								this.buffer[p + 1] === 0x4e && this.buffer[p + 2] === 0x45 && this.buffer[p + 3] === 0x54 &&
								this.buffer[p + 4] === 0x53 && this.buffer[p + 5] === 0x43 && this.buffer[p + 6] === 0x41 &&
								this.buffer[p + 7] === 0x50 && this.buffer[p + 8] === 0x45 && this.buffer[p + 9] === 0x32 &&
								this.buffer[p + 10] === 0x2e && this.buffer[p + 11] === 0x30 &&
								// Sub-block
								this.buffer[p + 12] === 0x03 && this.buffer[p + 13] === 0x01 && this.buffer[p + 16] === 0) {
								p += 14;
								loop_count = this.buffer[p++] | this.buffer[p++] << 8;
								p++;  // Skip terminator.
							} else {  // We don't know what it is, just try to get past it.
								p += 12;
								while (true) {  // Seek through subblocks.
									let block_size = this.buffer[p++];
									// Bad block size (ex: undefined from an out of bounds read).
									if (!(block_size >= 0)) throw Error("Invalid block size");
									if (block_size === 0) break;  // 0 size is terminator
									p += block_size;
								}
							}
							break;

						case 0xf9:  // Graphics Control Extension
							if (this.buffer[p++] !== 0x4 || this.buffer[p + 4] !== 0)
								throw new Error("Invalid graphics extension block.");
							const pf1 = this.buffer[p++];
							delay = this.buffer[p++] | this.buffer[p++] << 8;
							transparent_index = this.buffer[p++];
							if ((pf1 & 1) === 0) transparent_index = null;
							disposal = pf1 >> 2 & 0x7;
							p++;  // Skip terminator.
							break;

						// Plain Text Extension could be present and we just want to be able
						// to parse past it.  It follows the block structure of the comment
						// extension enough to reuse the path to skip through the blocks.
						case 0x01:  // Plain Text Extension (fallthrough to Comment Extension)
						case 0xfe:  // Comment Extension.
							while (true) {  // Seek through subblocks.
								let block_size = this.buffer[p++];
								// Bad block size (ex: undefined from an out of bounds read).
								if (!(block_size >= 0)) throw Error("Invalid block size");
								if (block_size === 0) break;  // 0 size is terminator
								// console.log(buf.slice(p, p+block_size).toString('ascii'));
								p += block_size;
							}
							break;

						default:
							throw new Error(
								"Unknown graphic control label: 0x" + this.buffer[p - 1].toString(16));
					}
					break;

				case 0x2c:  // Image Descriptor.
					const x = this.buffer[p++] | this.buffer[p++] << 8;
					const y = this.buffer[p++] | this.buffer[p++] << 8;
					const w = this.buffer[p++] | this.buffer[p++] << 8;
					const h = this.buffer[p++] | this.buffer[p++] << 8;
					const pf2 = this.buffer[p++];
					const local_palette_flag = pf2 >> 7;
					const interlace_flag = pf2 >> 6 & 1;
					const num_local_colors_pow2 = pf2 & 0x7;
					const num_local_colors = 1 << num_local_colors_pow2 + 1;
					let palette_offset = global_palette_offset;
					let palette_size = global_palette_size;
					let has_local_palette = false;
					if (local_palette_flag) {
						has_local_palette = true;
						palette_offset = p;  // Override with local palette.
						palette_size = num_local_colors;
						p += num_local_colors * 3;  // Seek past palette.
					}

					const data_offset = p;

					p++;  // codesize
					while (true) {
						const block_size = this.buffer[p++];
						// Bad block size (ex: undefined from an out of bounds read).
						if (!(block_size >= 0)) throw Error("Invalid block size");
						if (block_size === 0) break;  // 0 size is terminator
						p += block_size;
					}

					const frame = new Frame(
						this, this.frames.length,
						x, y, w, h,
						delay, disposal,
						!!interlace_flag,
						transparent_index,
						data_offset,
						p - data_offset,
						has_local_palette,
						palette_offset,
						palette_size,
					);

					this.frames.push(frame);
					break;

				case 0x3b:  // Trailer Marker (end of file).
					no_eof = false;
					break;

				default:
					this.errors.push(new Error("Unknown gif block: 0x" + this.buffer[p - 1].toString(16)));
			}
		}
	}
}