export class Frame {
	/** @type {number} */ left = 0;
	/** @type {number} */ top = 0;
	/** @type {number} */ width = 0;
	/** @type {number} */ height = 0;
	/** @type {number} */ delay = 0;
	/** @type {number} */ disposeOp = 0;
	/** @type {number} */ blendOp = 0;
	/** @type {Blob} */ imageData = null;
	/** @type {ImageBitmap} */ imageBitmap = null;

	/** @return {Promise<ImageBitmap>} */
	createBitmap() {
		return new Promise(async resolve => {
			this.imageBitmap = await createImageBitmap(this.imageData);
			resolve(this.imageBitmap)
		});
	}

}
