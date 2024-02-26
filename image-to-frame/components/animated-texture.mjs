// noinspection CssUnusedSymbol

import {GIF} from "../../gif/GIF.mjs";
import {ErrorMessage} from "../../components/error-message.mjs";
import {GrowingPacker} from "../../utils/growing-packer.mjs";
import {ImagePreview} from "../../components/image-preview.mjs";

export class AnimatedTexture extends HTMLElement {
	constructor() {
		super();

		this.#shadow = this.attachShadow({mode: 'open'});
		this.#shadow.adoptedStyleSheets = [ImagePreview.sheet, sheet];

		this.#container = document.createElement('div');
		this.#container.classList.add('container', 'loading');
		this.#shadow.appendChild(this.#container);


		this.#style = document.createElement('style');
		this.#container.appendChild(this.#style);
		this.#styleClass = `class-${Date.now()}${Math.random()}`.replace('.', '');

		this.#loader = document.createElement('div');
		this.#loader.classList.add('loader');
		this.#container.appendChild(this.#loader);
	}

	/** @type {HTMLDivElement} */ #container;
	/** @type {HTMLDivElement} */ #loader;
	/** @type {HTMLStyleElement} */ #style;
	/** @type {string} */ #styleClass;
	/** @type {ShadowRoot} */ #shadow;

	/**
	 * @param {ArrayBuffer} buffer
	 * @return {Promise<void>}
	 */
	async #add(buffer) {
		this.gif = new GIF(buffer);
		this.gif.parse();

		if (this.gif.errors.length) {
			ErrorMessage.fromErrors(this.gif.errors, this.#shadow);
		}

		this.#container.style.width = `${this.gif.width}px`;
		this.#container.style.aspectRatio = `${this.gif.width}/${this.gif.height}`;

		this.packer = new GrowingPacker();

		for (const frame of this.gif.frames) {
			frame.imageData;
			this.packer.item = {index: frame.index, width: this.gif.width, height: this.gif.height};
		}

		this.packer.pack();

		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');

		canvas.width = this.packer.width;
		canvas.height = this.packer.height;

		for (const item of this.packer.items) {
			const frame = this.gif.frames[item.index];
			ctx.putImageData(frame.imageDataFrame, item.x, item.y);
		}

		this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

		/** @type {Blob} */
		const iblob = await new Promise(resolve => canvas.toBlob(blob => resolve(blob)));
		canvas.remove();

		const image = new Image();
		image.src = URL.createObjectURL(iblob);
		image.classList.add(this.#styleClass);

		image.style.width = `${this.packer.width / this.gif.width * 100}%`;
		image.style.aspectRatio = `${this.packer.width}/${this.packer.height}`;
		this.#container.appendChild(image);

		image.getBoundingClientRect();

		this.#container.classList.remove('loading');

		let time = 0;
		{
			const list = [];

			for (const item of this.packer.items) {
				const i = item.index;
				const delay = i > 0 ? this.gif.frames[i - 1].delay : 0;
				list.push(`${time * 100}% {transform:translate(${item.x / this.packer.width * -100}%,${item.y / this.packer.height * -100}%)}\n`);
				time += delay / this.gif.duration;
			}
			list.push(`100% {transform:translate(0,0)}\n`);

			this.#style.textContent = `.${this.#styleClass} {animation: ${this.#styleClass} ${Math.round(this.gif.duration * 10)}ms steps(1) infinite; }\n@keyframes ${this.#styleClass} {\n${list.join('')}}`;
		}
	}

	/** @param {ArrayBuffer} buffer */
	set buffer(buffer) {
		// noinspection JSIgnoredPromiseFromCall
		this.#add(buffer);
	}

}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
	//language=CSS
	`
		:host {
			flex-direction: column;
			gap: 1rem;
		}

		.container {
			overflow: hidden;
			align-self: center;
		}

		.container img {
			position: absolute;
			transition: opacity 800ms ease-in-out, filter 400ms ease-out;
			opacity: 1;
		}

		.loader {
			transition: opacity 1200ms ease-in-out;
			opacity: 0;
		}

		.loading img {
			opacity: 0;
			filter: blur(5px);
		}

		.loading .loader {
			opacity: 1;
		}

	`);

customElements.define('animated-texture', AnimatedTexture);
