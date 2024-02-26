// noinspection CssUnusedSymbol

export class CyberLink extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		this.parent = document.createElement('div');
		this.parent.classList.add('button');
		shadow.appendChild(this.parent);

		this.a = document.createElement('a');
		this.parent.appendChild(this.a);

		this.txt = document.createElement('div');
		this.txt.classList.add('text');
		this.a.appendChild(this.txt);
	}

	/** @param {string} text */
	set text(text) {
		this.txt.textContent = text;
	}

	/** @param {string} download */
	set download(download) {
		this.a.download = download;
	}

	/** @param {'red'|'green'|'blue'} color */
	set color(color) {
		this.parent.dataset.color = color;
	}

	set href(href) {
		this.a.href = href;
	}

	/** @param {'_blank'} target */
	set target(target) {
		this.a.target = target;
	}
}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
	//language=CSS
	`
		:host {
			user-select: none;
		}

		.button {
			position: relative;
			top: 0;
			left: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: 250px;
			height: 50px;
			margin: 8px 0;
			cursor: pointer;
			--cx: transparent;
		}
		.button::before {
			bottom: -5px;
		}
		.button::after {
			top: -5px;
		}
		.button::before, .button::after {
			border-radius: 10px;
			position: absolute;
			content: "";
			left: 50%;
			width: 30px;
			height: 10px;
			transition: 0.5s;
			transition-delay: 0.5s;
			transform: translatex(-50%);
			background: var(--cx);
			box-shadow: 0 0 5px var(--cx), 0 0 15px var(--cx), 0 0 30px var(--cx), 0 0 60px var(--cx);
		}
		.button:hover::before {
			bottom: 0;
			width: 80%;
			height: 50%;
			border-radius: 30px;
		}
		.button:hover::after {
			top: 0;
			width: 80%;
			height: 50%;
			border-radius: 30px;
		}

		[data-color=red] {--cx: #ff1f71}
		[data-color=blue] {--cx: #2db2ff}
		[data-color=green] {--cx: #1eff45}

		.button:hover a {
			letter-spacing: 3px;
		}
		.button:hover a::before {
			transform: skewX(45deg) translate(200px);
		}

		a {
			position: absolute;
			z-index: 1;
			top: 0;
			left: 0;
			display: flex;
			overflow: hidden;
			align-items: center;
			justify-content: center;
			box-sizing: border-box;
			width: 100%;
			height: 100%;
			padding: 10px;
			transition: 0.5s;
			text-decoration: none;
			letter-spacing: 1px;
			color: #fff;
			border-top: 1px solid rgba(255, 255, 255, 0.1);
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			border-radius: 30px;
			background: rgba(255, 255, 255, 0.05);
			box-shadow: 0 15px 15px rgba(0, 0, 0, 0.3);
			backdrop-filter: blur(15px);
		}
		a::before {
			position: absolute;
			top: 0;
			left: 0;
			width: 50%;
			height: 100%;
			content: "";
			transition: 0.5s;
			transform: skewX(45deg) translate(0);
			background: linear-gradient(to left, rgba(255, 255, 255, 0.15), transparent);
			filter: blur(0px);
		}

		.text {
			pointer-events: none;
			text-align: center;
			animation: glow 1s ease-in-out infinite alternate;
			font-size: 2rem;
			color: #fff;
			text-shadow: 0 0 7px #fff,
			0 0 10px #fff,
			0 0 21px #fff;
		}
	`);

customElements.define('cyber-link', CyberLink);
