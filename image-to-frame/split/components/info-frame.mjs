import {ImagePreview} from "../../../components/image-preview.mjs";

export class InfoFrame extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		this.parent = document.createElement('div');
		this.parent.classList.add('parent');
		shadow.appendChild(this.parent);

		this.left = new ImagePreview();
		this.parent.appendChild(this.left);

		this._center = document.createElement('div');
		this.parent.appendChild(this._center);

		this.right = new ImagePreview();
		this.parent.appendChild(this.right);
	}

	/**
	 * @param {number} width
	 * @param {number} height
	 */
	size(width, height) {
		this.left.size(width, height);
		this.right.size(width, height);
	}

	/**
	 * @param {HTMLElement} elem
	 */
	set center(elem) {
		this._center.appendChild(elem);
	}

}

const sheet = new CSSStyleSheet();

// noinspection CssUnusedSymbol
sheet.replaceSync(
	//language=CSS
	`
		.parent {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			flex-wrap: wrap;
		}

		.parent > div > * {
			position: sticky;
			top: 0;
		}
	`);

customElements.define('info-frame', InfoFrame);