export default function (code_stream, p, output, output_length) {
	const min_code_size = code_stream[p++];

	const clear_code = 1 << min_code_size;
	const eoi_code = clear_code + 1;
	let next_code = eoi_code + 1;

	let cur_code_size = min_code_size + 1;  // Number of bits per code.
	// NOTE: This shares the same name as the encoder, but has a different
	// meaning here.  Here this masks each code coming from the code stream.
	let code_mask = (1 << cur_code_size) - 1;
	let cur_shift = 0;
	let cur = 0;

	let op = 0;  // Output pointer.

	let subblock_size = code_stream[p++];

	const code_table = new Int32Array(4096);  // Can be signed, we only use 20 bits.

	let prev_code = null;  // Track code-1.

	while (true) {
		// Read up to two bytes, making sure we always 12-bits for max sized code.
		while (cur_shift < 16) {
			if (subblock_size === 0) {
				// No more data to be read.
				break;
			}

			cur |= code_stream[p++] << cur_shift;
			cur_shift += 8;

			if (subblock_size === 1) {  // Never let it get to 0 to hold logic above.
				subblock_size = code_stream[p++];  // Next subblock.
			} else {
				--subblock_size;
			}
		}

		// We should never really get here, we should have received
		// and EOI.
		if (cur_shift < cur_code_size) {
			break;
		}

		const code = cur & code_mask;
		cur >>= cur_code_size;
		cur_shift -= cur_code_size;

		// Maybe should check that the first code was a clear code,
		// at least this is what you're supposed to do.  But actually our encoder
		// now doesn't emit a clear code first anyway.
		if (code === clear_code) {
			// We don't actually have to clear the table.  This could be a good idea
			// for greater error checking, but we don't really do any anyway.  We
			// will just track it with next_code and overwrite old entries.

			next_code = eoi_code + 1;
			cur_code_size = min_code_size + 1;
			code_mask = (1 << cur_code_size) - 1;

			// Don't update prev_code ?
			prev_code = null;
			continue;
		} else if (code === eoi_code) {
			break;
		}

		// We have a similar situation as the decoder, where we want to store
		// variable length entries (code table entries), but we want to do in a
		// faster manner than an array of arrays.  The code below stores sort of a
		// linked list within the code table, and then "chases" through it to
		// construct the dictionary entries.  When a new entry is created, just the
		// last byte is stored, and the rest (prefix) of the entry is only
		// referenced by its table entry.  Then the code chases through the
		// prefixes until it reaches a single byte code.  We have to chase twice,
		// first to compute the length, and then to actually copy the data to the
		// output (backwards, since we know the length).  The alternative would be
		// storing something in an intermediate stack, but that doesn't make any
		// more sense.  I implemented an approach where it also stored the length
		// in the code table, although it's a bit tricky because you run out of
		// bits (12 + 12 + 8), but I didn't measure much improvements (the table
		// entries are generally not the long).  Even when I created benchmarks for
		// very long table entries the complexity did not seem worth it.
		// The code table stores the prefix entry in 12 bits and then the suffix
		// byte in 8 bits, so each entry is 20 bits.

		const chase_code = code < next_code ? code : prev_code;

		// Chase what we will output, either {CODE} or {CODE-1}.
		let chase_length = 0;
		let chase = chase_code;
		while (chase > clear_code) {
			chase = code_table[chase] >> 8;
			++chase_length;
		}

		const k = chase;

		const op_end = op + chase_length + (chase_code !== code ? 1 : 0);
		if (op_end > output_length) {
			throw new Error('Warning, gif stream longer than expected.');
		}

		// Already have the first byte from the chase, might as well write it fast.
		output[op++] = k;

		op += chase_length;
		let b = op;  // Track pointer, writing backwards.

		if (chase_code !== code) {
			// The case of emitting {CODE-1} + k.
			output[op++] = k;
		}

		chase = chase_code;
		while (chase_length--) {
			chase = code_table[chase];
			output[--b] = chase & 0xff;  // Write backwards.
			chase >>= 8;  // Pull down to the prefix code.
		}

		if (prev_code !== null && next_code < 4096) {
			code_table[next_code++] = prev_code << 8 | k;
			// Figure out this clearing vs code growth logic better.  I
			// have an feeling that it should just happen somewhere else, for now it
			// is awkward between when we grow past the max and then hit a clear code.
			// For now just check if we hit the max 12-bits (then a clear code should
			// follow, also of course encoded in 12-bits).
			if (next_code >= code_mask + 1 && cur_code_size < 12) {
				++cur_code_size;
				code_mask = code_mask << 1 | 1;
			}
		}

		prev_code = code;
	}

	if (op !== output_length) {
		throw new Error('Warning, gif stream shorter than expected.');
	}

	return output;
}