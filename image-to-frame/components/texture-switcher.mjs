// noinspection CssUnusedSymbol

export class TextureSwitcher extends HTMLElement {
	constructor() {
		super();

		const key = 'texture-is-dds';

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		const button = document.createElement('div');
		button.classList.add('button');

		this.active = !!localStorage.getItem(key);

		if (this.active) {
			button.classList.add('active');
		}

		shadow.appendChild(button);


		button.addEventListener('click', () => {
			button.classList.toggle('active');
			this.active = button.classList.contains('active');

			if (this.active) {
				localStorage.setItem(key, '1');
			} else {
				localStorage.removeItem(key);
			}

			shadow.dispatchEvent(new CustomEvent('toggle-change', {
				bubbles: true,
				composed: true,
				detail: this.active,
			}));

		});

		button.innerHTML = '<div class="toggler"></div>'

	}


}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
	//language=CSS
	`
		:host {
			display: flex;
			justify-content: flex-end;
			position: sticky;
			top: 1rem;
			z-index: 10;
			--br: 6px;
		}

		.button {
			display: grid;
			grid-auto-columns: 1fr;
			grid-auto-flow: column;
			background: #343434;
			border-radius: var(--br);
			position: relative;
			cursor: pointer;
		}

		.button::before {
			content: 'BLP';
		}

		.button::after {
			content: 'DDS';
		}

		.button::before,
		.button::after {
			text-align: center;
			padding: .5rem 1rem;
			position: relative;
			z-index: 10;
			font-weight: bolder;
			transition: color 400ms ease-in-out;
			font-size: 1.5rem;
			font-family: Impact;
		}

		.button.active::before,
		.button:not(.active)::after {
			color: #6c6c6c;
		}

		.toggler {
			position: absolute;
			width: 50%;
			top: 0;
			left: 0;
			bottom: 0;
			z-index: 5;
			background: #3e69b4;
			transition: transform 200ms ease-in-out, border-radius 200ms ease-in-out;
		}

		.button:not(.active) .toggler {
			border-top-left-radius: var(--br);
			border-bottom-left-radius: var(--br);
		}

		.active .toggler {
			transform: translateX(100%);
			border-top-right-radius: var(--br);
			border-bottom-right-radius: var(--br);
		}

	`);

customElements.define('texture-switcher', TextureSwitcher);
