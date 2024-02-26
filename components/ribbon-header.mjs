// noinspection CssUnusedSymbol

export class RibbonHeader extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		this.parent = document.createElement('div');
		this.parent.classList.add('ribbon');
		shadow.appendChild(this.parent);

		this.#header = document.createElement('h3');
		this.parent.appendChild(this.#header);

		this.parent.insertAdjacentHTML('afterbegin', '<span class="left-fold"></span>');
		this.parent.insertAdjacentHTML('beforeend', '<span class="right-fold"></span>');
	}

	/**
	 * @param {string} text
	 * @param {HTMLElement|ShadowRoot} parent
	 * @return {RibbonHeader}
	 */
	static fromText(text, parent) {
		const header = new RibbonHeader();
		header.text = text;
		parent.appendChild(header);
		return header;
	}

	/** @type {HTMLElement} */ #header;

	/** @param {string} text */
	set text(text) {
		this.#header.textContent = text;
	}

	get text() {
		return this.#header.textContent;
	}

}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
	//language=CSS
	`
		.ribbon {
			position: relative;
			background: #0070BB;
			color: white;
			display: block;
			text-align: center;
			z-index: 3;
			margin: 1rem 2rem;
		}
		.ribbon:before {
			position: absolute;
			content: "";
			width: 0;
			height: 0;
			border-style: solid;
			border-width: 0 12px 12px 0;
			border-color: transparent #003355 transparent transparent;
			left: -1px;
			bottom: -12px;
			z-index: 1;
		}
		.ribbon:after {
			position: absolute;
			content: "";
			width: 0;
			height: 0;
			border-style: solid;
			border-width: 12px 12px 0 0;
			border-color: #003355 transparent transparent transparent;
			right: -1px;
			bottom: -12px;
			z-index: 1;
		}
		.ribbon .left-fold {
			background-color: #005188;
			background-image: -webkit-linear-gradient(-180deg, #005188, #0061a2);
			background-image: linear-gradient(-90deg, #005188, #0061a2);
			position: absolute;
			height: 50px;
			width: 25px;
			left: -15px;
			bottom: -12px;
			display: block;
			margin: 0;
			border-right: 1px solid #005188;
		}
		.ribbon .left-fold:before {
			position: absolute;
			content: "";
			width: 0;
			height: 0;
			border-style: solid;
			border-width: 0 15px 25px 0;
			border-color: transparent #0061a2 transparent transparent;
			left: -15px;
			top: 0;
		}
		.ribbon .left-fold:after {
			position: absolute;
			content: "";
			width: 0;
			height: 0;
			border-style: solid;
			border-width: 0 0 25px 15px;
			border-color: transparent transparent #0061a2 transparent;
			left: -15px;
			bottom: 0;
		}
		.ribbon h3 {
			z-index: 2;
			position: relative;
			background: #0070BB;
			width: 100%;
			display: block;
			font-size: 19px;
			line-height: 1.3em;
			padding: 15px 0;
			font-weight: 600;
			letter-spacing: 1px;
			margin: 0;
		}
		.ribbon .right-fold {
			background-color: #005188;
			background-image: -webkit-linear-gradient(-360deg, #005188, #0061a2);
			background-image: linear-gradient(90deg, #005188, #0061a2);
			position: absolute;
			height: 50px;
			width: 25px;
			right: -15px;
			bottom: -12px;
			display: block;
			margin: 0;
			border-left: 1px solid #005188;
		}
		.ribbon .right-fold:before {
			position: absolute;
			content: "";
			width: 0;
			height: 0;
			border-style: solid;
			border-width: 25px 15px 0 0;
			border-color: #0061a2 transparent transparent transparent;
			right: -15px;
			top: 0;
		}
		.ribbon .right-fold:after {
			position: absolute;
			content: "";
			width: 0;
			height: 0;
			border-style: solid;
			border-width: 25px 0 0 15px;
			border-color: transparent transparent transparent #0061a2;
			right: -15px;
			bottom: 0;
		}
	`);

customElements.define('ribbon-header', RibbonHeader);
