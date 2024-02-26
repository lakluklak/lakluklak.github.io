export class ErrorMessage extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		this.#container = document.createElement('div');
		this.#container.classList.add('container');
		shadow.appendChild(this.#container);
	}

	/** @type {HTMLElement} */ #container;

	/**
	 * @param {string} text
	 * @param {HTMLElement|ShadowRoot} parent
	 * @return {ErrorMessage}
	 */
	static fromText(text, parent) {
		const message = new ErrorMessage();
		message.#container.insertAdjacentHTML('afterbegin', `<div>${text}</div>`);
		parent.appendChild(message);
		return message;
	}

	/**
	 * @param {Error[]} errors
	 * @param {HTMLElement|ShadowRoot} parent
	 * @return {ErrorMessage}
	 */
	static fromErrors(errors, parent){
		const message = new ErrorMessage();
		this.#container.textContent = '';
		for (const e of errors) {
			message.parent.insertAdjacentHTML('afterbegin', `<div>${e}</div>`);
		}
		parent.appendChild(message);
		return message;
	}
}

const sheet = new CSSStyleSheet();

// noinspection CssUnusedSymbol
sheet.replaceSync(
	//language=CSS
	`
		.container {
			display: flex;
			background-color: rgb(233, 30, 99);
			flex-direction: column;
			padding: 1rem;
			gap: 1rem;
			border-radius: 0.1rem;
			box-shadow: 0 0 5px black;
		}

	`);

customElements.define('error-message', ErrorMessage);
