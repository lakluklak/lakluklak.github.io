// noinspection CssUnusedSymbol

export class YaInput extends HTMLElement {
    constructor() {
        super();

        this.#shadow = this.attachShadow({mode: 'open'});
        this.#shadow.adoptedStyleSheets = [sheet];

        const create = name => {
            const key = `translate-ya-${name}`;

            const input = document.createElement('input');
            input.autocomplete = 'off';
            input.placeholder = name;
            this.#shadow.appendChild(input);
            const v = localStorage.getItem(key);
            input.value = v ?? '';

            input.oninput = () => localStorage.setItem(key, input.value);

            return input;
        };
        this.#token = create('token');
        this.#folder = create('folder');
    }

    /** @return {string} */
    get token() {
        return this.#token.value;
    }

    /** @return {string} */
    get folder() {
        return this.#folder.value;
    }

    /** @type {HTMLInputElement} */ #token;
    /** @type {HTMLInputElement} */ #folder;
    /** @type {ShadowRoot} */ #shadow;
}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
    //language=CSS
    `
		:host {
			display: grid;
			grid-template-columns: 1fr 1fr;
			align-items: center;
			gap: 1rem;
		}

	`
);

customElements.define('ya-input', YaInput);
