/**
 * @property {number} currFrameNumber
 * @property {Frame} currFrame
 * @property {boolean} paused
 * @property {boolean} ended
 */
export class APNGOLD {
	/** @type {number} */
	width = 0;
	/** @type {number} */
	height = 0;
	/** @type {number} */
	numPlays = 0;
	/** @type {number} */
	time = 0;
	/** @type {Frame[]} */
	frames = [];

	createBitmap() {
		return Promise.all(this.frames.map(f => f.createBitmap()));
	}
}