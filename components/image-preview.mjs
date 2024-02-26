export class ImagePreview extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [ImagePreview.sheet];

		this.#container = document.createElement('div');
		this.#container.classList.add('container');
		shadow.appendChild(this.#container);

		this.canvas = document.createElement('canvas');
		this.#container.appendChild(this.canvas);
		this.ctx = this.canvas.getContext('2d');
	}

	/** @type {HTMLDivElement} */ #container;

	/**
	 * @param {number} width
	 * @param {number} height
	 */
	size(width, height) {
		this.canvas.width = width;
		this.canvas.height = height;
		this.#container.style.width = `${width}px`;
		this.canvas.style.aspectRatio = this.canvas.style.aspectRatio = `${width}/${height}`;
	}

	/** @type {HTMLElement} */ #loader;

	/** @param {boolean} loading */
	set loading(loading) {
		if (loading) {
			if (this.#loader) {
				return;
			}
			this.#loader = document.createElement('div');
			this.#loader.classList.add('loader');
			this.#container.appendChild(this.#loader);
		} else {
			this.#loader?.remove();
		}
	}

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param text
	 */
	tip(x, y, text) {
		const tip = document.createElement('div');
		tip.classList.add('tip');
		tip.textContent = text;
		tip.style.left = `${x / this.canvas.width * 100}%`;
		tip.style.top = `${y / this.canvas.height * 100}%`;
		this.#container.appendChild(tip);
	}

	/** @type {HTMLElement} */ #border;

	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	border(x, y, width, height) {
		if (!this.#border) {
			this.#border = document.createElement('div');
			this.#border.classList.add('border');
			this.#container.appendChild(this.#border);
		}

		this.#border.style.left = `${x / this.canvas.width * 100}%`;
		this.#border.style.top = `${y / this.canvas.height * 100}%`;
		this.#border.style.width = `${width / this.canvas.width * 100}%`;
		this.#border.style.height = `${height / this.canvas.height * 100}%`;
	}

	static #sheet;

	static get sheet() {
		if (ImagePreview.#sheet) {
			return ImagePreview.#sheet;
		}
		ImagePreview.#sheet = new CSSStyleSheet();

		// noinspection CssUnusedSymbol
		ImagePreview.sheet.replaceSync(
			//language=CSS
			`
				:host {
					max-width: 100%;
					display: flex;
					justify-content: center;
				}

				/*noinspection CssUnresolvedCustomProperty*/
				.container {
					--a: rgba(255, 255, 255, .15);
					display: flex;
					background-color: #000;
					background-image: linear-gradient(45deg, var(--a) 25%, transparent 25%),
					linear-gradient(-45deg, var(--a) 25%, transparent 25%),
					linear-gradient(45deg, transparent 75%, var(--a) 75%),
					linear-gradient(-45deg, transparent 75%, var(--a) 75%);
					background-size: 20px 20px;
					background-position: 0 0, 0 10px, 10px -10px, -10px 0;
					box-shadow: 0 0 10px black;
					position: relative;
					max-width: 100%;
					align-self: flex-start;
				}

				canvas {
					max-width: 100%;
				}

				.tip {
					position: absolute;
					padding: .1rem .5rem;
					background: #1e1e1e;
					pointer-events: none;
					box-shadow: 0 0 5px #1e1e1e;
					color: #5aff00;
					text-shadow: 0 0 1px #000;
				}

				/*noinspection CssReplaceWithShorthandSafely,CssUnresolvedCustomProperty*/
				.border {
					--a: #ff00ed;
					pointer-events: none;
					position: absolute;
					background: linear-gradient(to right, var(--a) 50%, transparent 0%),
					linear-gradient(var(--a) 50%, transparent 0%),
					linear-gradient(to right, var(--a) 50%, transparent 0%),
					linear-gradient(var(--a) 50%, transparent 0%);
					background-position: top, right, bottom, left;
					background-repeat: repeat-x, repeat-y;
					background-size: 10px 1px, 1px 10px;
				}

				.loader {
					transform: translateX(-50%) translateY(-50%) rotateZ(45deg);
					perspective: 1000px;
					border-radius: 50%;
					width: 48px;
					height: 48px;
					color: #fff;
					position: absolute;
					left: 50%;
					top: 50%;
					z-index: 10;
				}
				.loader:before,
				.loader:after {
					content: '';
					display: block;
					position: absolute;
					top: 0;
					left: 0;
					width: inherit;
					height: inherit;
					border-radius: 50%;
					transform: rotateX(70deg);
					animation: 1s spin linear infinite;
				}
				.loader:after {
					color: #FF3D00;
					transform: rotateY(70deg);
					animation-delay: .4s;
				}

				@keyframes rotate {
					0% {
						transform: translate(-50%, -50%) rotateZ(0deg);
					}
					100% {
						transform: translate(-50%, -50%) rotateZ(360deg);
					}
				}

				@keyframes rotateccw {
					0% {
						transform: translate(-50%, -50%) rotate(0deg);
					}
					100% {
						transform: translate(-50%, -50%) rotate(-360deg);
					}
				}

				@keyframes spin {
					0%,
					100% {
						box-shadow: .2em 0 0 0 currentcolor;
					}
					12% {
						box-shadow: .2em .2em 0 0 currentcolor;
					}
					25% {
						box-shadow: 0 .2em 0 0 currentcolor;
					}
					37% {
						box-shadow: -.2em .2em 0 0 currentcolor;
					}
					50% {
						box-shadow: -.2em 0 0 0 currentcolor;
					}
					62% {
						box-shadow: -.2em -.2em 0 0 currentcolor;
					}
					75% {
						box-shadow: 0 -.2em 0 0 currentcolor;
					}
					87% {
						box-shadow: .2em -.2em 0 0 currentcolor;
					}
				}

			`);

		return ImagePreview.#sheet;
	}
}

customElements.define('image-preview', ImagePreview);

