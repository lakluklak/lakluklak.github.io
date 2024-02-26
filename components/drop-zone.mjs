// noinspection CssUnusedSymbol,JSUnusedGlobalSymbols

import fileNameExtension from '../utils/file-name-extension.mjs';

export class DropZone extends HTMLElement {
	constructor() {
		super();

		const shadow = this.attachShadow({mode: 'open'});
		shadow.adoptedStyleSheets = [sheet];

		this.dropzone = document.createElement('div');
		this.dropzone.classList.add('dropzone');
		shadow.appendChild(this.dropzone);

		const inner = document.createElement('div');
		inner.classList.add('inner');
		this.dropzone.appendChild(inner);

		const box = document.createElement('div');
		inner.appendChild(box);
		box.classList.add('box');

		this.input = document.createElement('input');
		this.input.type = 'file';
		this.input.multiple = true;
		this.input.classList.add('input');
		box.appendChild(this.input);

		const text = document.createElement('div');
		text.innerHTML = '<div>UPLOAD</div><div></div>';
		text.classList.add('neon');
		this._accept = text.querySelector('div:last-child');

		box.appendChild(text);

		this.dragleave = this.dragleave.bind(this);
		this.drop = this.drop.bind(this);
		this.upload = this.upload.bind(this);
		this.dragenter = this.dragenter.bind(this);
		this.change = this.change.bind(this);
		this.paste = this.paste.bind(this);

		addEventListener('dragenter', this.dragenter);

		this.dropzone.addEventListener('drop', this.drop);
		this.input.addEventListener('change', this.change);

		addEventListener('paste', this.paste);
	}

	/** @param {string} accept */
	set accept(accept) {
		this.input.accept = accept;

		const list = accept.split(',');

		for (const v of list) {
			this._accept.insertAdjacentHTML('beforeend', `<i>${v}</i>`);
		}
	}

	/** @param {File} file */
	upload(file) {
		const exts = this.input.accept.split(',');
		const ext = fileNameExtension(file.name);
		if (!ext || exts.indexOf('.' + ext) < 0) {
			return;
		}

		const reader = new FileReader();

		if (this.#readAsText){
			reader.onload = e => this.#readAsText(file, e.target.result);
			reader.readAsText(file);
			return;
		}

		reader.onload = e => {
			this.dropzone.dispatchEvent(new CustomEvent('bufferupload', {
				bubbles: true,
				composed: true,
				detail: [file, e.target.result],
			}));
		};

		reader.readAsArrayBuffer(file);
	}

	/** @type {function(File, string)} */ #readAsText;
	/** @param {function(File, string)} func */
	set readAsText(func) {
		this.#readAsText = func;
	}
	/** @return {function(File, string)} */
	get readAsText(){
		return this.#readAsText;
	}

	/** @param {Event} e */
	change(e) {
		e.preventDefault();
		e.stopPropagation();
		if (e.target.files.length === 0) {
			return;
		}
		for (const file of e.target.files) {
			this.upload(file);
		}
		e.target.value = null;
	}

	dragenter(e) {
		e.preventDefault();
		e.stopPropagation();
		this.dropzone.classList.add('active');
		this.dropzone.addEventListener('dragleave', this.dragleave);
	}

	/** @param {Event} e */
	dragleave(e) {
		e.preventDefault();
		e.stopPropagation();
		this.dropzone.classList.remove('active');
		this.dropzone.removeEventListener('dragleave', this.dragleave);
	}

	/**
	 * @param {DataTransferItemList} itemList
	 * @private
	 */
	async _upload(itemList) {
		const list = [];

		for (const item of itemList) {
			const file = item.webkitGetAsEntry();
			if (file) {
				list.push(scanFiles(file));
			}
		}

		const files = (await Promise.all(list)).flat(100);
		for (const file of files) {
			if (file.name.startsWith('.')) {
				continue;
			}
			this.upload(file);
		}
	}

	async paste(e) {
		await this._upload(e.clipboardData.items);
	}

	/** @param {DragEvent} e */
	async drop(e) {
		this.dragleave(e);
		await this._upload(e.dataTransfer.items);
	}
}

const sheet = new CSSStyleSheet();
// noinspection CssUnresolvedCustomProperty
sheet.replaceSync(
	//language=CSS
	`
		.dropzone {
			height: 6rem;
		}

		.inner {
			position: relative;
			height: 100%;
			background: linear-gradient(0deg, #000, #272727);
			border-radius: 0.313rem;
		}

		.inner:before, .inner:after {
			position: absolute;
			z-index: -1;
			top: -2px;
			left: -2px;
			width: calc(100% + 4px);
			height: calc(100% + 4px);
			content: "";
			animation: dropzone 20s linear infinite;
			border-radius: 0.313rem;
			background: linear-gradient(45deg, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000, #fb0094, #0000ff, #00ff00, #ffff00, #ff0000);
			background-size: 400%;
		}

		.inner:after {
			filter: blur(50px);
		}

		.box {
			position: relative;
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: inherit;
			z-index: 100;
		}

		.active .box {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			height: auto;

			--c1: rgba(30, 30, 30, 0.8);
			--c2: rgba(60, 60, 60, 0.8);
			background-image: repeating-linear-gradient(
					-45deg,
					var(--c1),
					var(--c1) 1rem,
					var(--c2) 1rem,
					var(--c2) 2rem
			);
			background-size: 200% 200%;
			animation: barberpole 60s linear infinite;
		}

		.input {
			position: absolute;
			top: 0;
			right: 0;
			bottom: 0;
			left: 0;
			width: 100%;
			height: 100%;
			cursor: pointer;
			opacity: 0;
			appearance: none;
			z-index: 10;
		}


		@keyframes barberpole {
			100% {
				background-position: 100% 100%;
			}
		}

		@keyframes dropzone {
			0% {
				background-position: 0 0;
			}
			50% {
				background-position: 400% 0;
			}
			100% {
				background-position: 0 0;
			}
		}

		.neon {
			font-size: 3rem;
			pointer-events: none;
			color: #fff;
			text-shadow: 0 0 5px #fff,
			0 0 10px #fff,
			0 0 20px #fff,
			0 0 40px #0ff,
			0 0 80px #0ff,
			0 0 90px #0ff,
			0 0 100px #0ff,
			0 0 150px #0ff;
			display: flex;
			gap: 0.2rem;
			flex-direction: column;
			align-items: center;
		}

		.neon div:last-child {
			font-size: 1rem;
			display: flex;
			gap: 0.2rem;
			line-height: 2rem;
		}

		.neon div:last-child:not(:empty) {
			margin-bottom: -2rem;
		}
	`);


customElements.define('drop-zone', DropZone);

/**
 * @param dir
 * @return {Promise<File[]>}
 */
const scanFiles = dir => {
	if (dir.isFile) {
		return new Promise(resolve => dir.file(file => resolve([file])));
	}
	const reader = dir.createReader();
	return new Promise((resolve, reject) => {
		const list = [];
		const readEntries = () => {
			reader.readEntries(entries => {
				if (!entries.length) {
					resolve(Promise.all(list));
				} else {
					list.push(Promise.all(entries.map(entry => entry.isFile ? new Promise(resolve => entry.file(file => resolve(file))) : scanFiles(entry))));
					readEntries();
				}
			}, error => reject(error));
		};
		readEntries();
	});
};