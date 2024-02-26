// noinspection CssUnusedSymbol

export class LineDivider extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		const div = document.createElement('div');
		div.classList.add('divider');
		shadow.appendChild(div);
	}
}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
	//language=CSS
	`
		:host {
			display: flex;
			justify-content: center;
		}
		
		.divider {
			height: 2px;
			width: 80%;
			background: linear-gradient(90deg, hsl(0, 0%, 20%), hsl(0, 0%, 70%), hsl(0, 0%, 20%));
		}
	`);

customElements.define('line-divider', LineDivider);
