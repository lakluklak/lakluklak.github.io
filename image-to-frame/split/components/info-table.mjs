export class InfoTable extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		this.parent = document.createElement('div');
		this.parent.classList.add('parent');
		shadow.appendChild(this.parent);

		this.table = document.createElement('table');
		this.parent.appendChild(this.table);

	}

	#header;

	/** @param {string} text */
	set header(text) {
		if (!this.#header) {
			const tr = document.createElement('tr');
			this.table.insertAdjacentElement('afterbegin', tr);
			this.#header = document.createElement('th');
			tr.appendChild(this.#header);
			this.#header.colSpan = 2;
		}
		this.#header.textContent = text;
	}

	/**
	 * @param {string} k
	 * @param {any} v
	 */
	addRow(k, v) {
		const tr = document.createElement('tr');
		this.table.appendChild(tr);

		const ta = document.createElement('td');
		tr.appendChild(ta);
		ta.textContent = k;

		const tb = document.createElement('td');
		tr.appendChild(tb);
		if (v == null) {
			tb.textContent = 'null';
			tb.classList.add('null');
			return;
		}

		tb.classList.add(typeof v);
		tb.innerHTML = v;
	}
}

const sheet = new CSSStyleSheet();

// noinspection CssUnusedSymbol
sheet.replaceSync(
	//language=CSS
	`
		.parent {
			display: flex;
			justify-content: center;
		}

		table {
			border-collapse: collapse;
		}

		td, th {
			background: #141414;
			border: 1px solid #494949;
			padding: 0.25rem 0.5rem;
			white-space: nowrap;
		}

		td b {
			color: #9aff00;
		}

		td i {
			color: #a0a0a0;
		}

		.boolean {
			color: #6475ff;
		}

	`);

customElements.define('info-table', InfoTable);
