// noinspection CssUnusedSymbol

const tagName = 'badge-checkbox';

export class BadgeCheckbox extends HTMLElement {
    /** @type {string} */#key;
    /** @type {HTMLLabelElement }*/ #label;
    /** @type {HTMLInputElement }*/ #input;
    /** @type {HTMLSpanElement }*/ #span;

    constructor() {
        super();

        const shadow = this.attachShadow({mode: 'open'});
        shadow.adoptedStyleSheets = [sheet];

        this.#label = document.createElement('label');
        shadow.appendChild(this.#label);

        this.#input = document.createElement('input');
        this.#input.type = 'checkbox';
        this.#input.autocomplete = 'off';
        this.#label.appendChild(this.#input);

        this.#span = document.createElement('span');
        this.#label.appendChild(this.#span);

        const div = document.createElement('div');
        div.classList.add('divider');
        shadow.appendChild(div);
    }

    /**
     * @param {string} key
     * @param {string} text
     * @param {HTMLElement} parent
     * @return {BadgeCheckbox}
     */
    static create(key, text, parent) {
        const bc = new BadgeCheckbox();
        bc.#span.innerHTML = text;

        bc.#key = `${tagName}-${key}`;
        bc.#input.checked = localStorage.getItem(bc.#key) !== null;
        bc.#input.addEventListener('change', () => {
            if (bc.#input.checked) localStorage.setItem(bc.#key, '1');
            else localStorage.removeItem(bc.#key);

            bc.#label.dispatchEvent(new CustomEvent('change', {
                bubbles: true,
                composed: true,
            }));
        });

        parent.appendChild(bc);

        return bc;
    }

    get checked() {
        return this.#input.checked;
    }
}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
    //language=CSS
    `
        :host {
            --color-accent: #19ff70;
            --color-text: #d1d1d1;
            --br: 5px;
            --outline: 2px;
        }

        label {
            display: inline-flex;
            color: var(--color-text);
            font-size: 1rem;
            font-weight: 600;
            align-items: center;
            border-radius: var(--br);
            background-color: #010101;
            padding: 5px 7px 5px 7px;
            user-select: none;
            position: relative;
        }

        span {
            pointer-events: none;
            display: flex;
            position: relative;
            align-items: center;
            transition: color 200ms;
        }

        input {
            appearance: none;
            margin: 0;
            border-radius: 3px;
            position: absolute;
            inset: 0;
            background: none;
            outline: var(--outline) solid transparent;
            outline-offset: 0;
            transition: outline-color 200ms;
            cursor: pointer;
        }

        input:focus-visible {
            outline-color: var(--color-accent);
        }

        :checked + span {
            color: var(--color-accent);
        }

        :checked + span::before {
            background-color: var(--color-accent);
        }

        span::before {
            content: "";
            display: inline-block;
            border-radius: 3px;
            background-color: #252525;
            margin-right: 8px;
            height: 16px;
            width: 16px;
            transition: background-color 200ms;
        }
    `);

customElements.define(tagName, BadgeCheckbox);
