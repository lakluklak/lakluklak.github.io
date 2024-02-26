import {DropZone} from '../../components/drop-zone.mjs';
import {RibbonHeader} from '../../components/ribbon-header.mjs';
import {WTS} from '../../wts/WTS.mjs';
import fileNameExtension from '../../utils/file-name-extension.mjs';
import {BadgeCheckbox} from '../../components/badge-checkbox.mjs';

const dropzone = new DropZone();
dropzone.accept = '.wts,.txt';
document.body.appendChild(dropzone);

const badges = document.createElement('div');
badges.classList.add('badges');
document.body.appendChild(badges);

const p = '/translate/txt';
const colorCode = BadgeCheckbox.create(`${p}-color`, 'remove colors', badges);
const wn2tn = BadgeCheckbox.create(`${p}-wn2tn`, '|n &#8594; \\n', badges);
const tn2wn = BadgeCheckbox.create(`${p}-tn2wn`, '\\n &#8594; |n', badges);

/** @type {Item[]} */ const items = [];

const reparse = () => {
    for (const item of items) {
        item.parse();
    }
};

colorCode.addEventListener('change', reparse);
wn2tn.addEventListener('change', reparse);
tn2wn.addEventListener('change', reparse);

class Item {
    /**
     * @param {File} file
     * @param {string} text
     */
    constructor(file, text) {
        this.#file = file;
        this.#text = text;

        RibbonHeader.fromText(file.name, document.body);

        this.#textarea = document.createElement('textarea');
        document.body.appendChild(this.#textarea);
        this.parse();
    }

    /** @param {string} text */
    set #textContent(text) {
        if (colorCode.checked) text = text.replace(/\|C[a-fA-F0-9]{8}|\|r/gm, '');
        this.#textarea.textContent = text;
    }

    get #textContent() {
        return this.#textarea.textContent;
    }

    parse() {
        this.#textContent = '';
        switch (fileNameExtension(this.#file.name)) {
            case 'wts':
                const wts = new WTS(this.#text);
                wts.read();
                let text = wts.toTXT();
                if (wn2tn.checked) text = text.replace(/\|n/gm, '\n');
                this.#textContent = text;
                break;

            case 'txt':
                const matches = this.#text.matchAll(/^(\d+):([^\n]*(?:\n(?!\d+:)[^\n]*)*)/gm);
                for (const match of matches) {
                    let text = match[2].trim();
                    if (tn2wn.checked) text = text.replace(/\n/gm, '|n');
                    this.#textContent += `STRING ${match[1]}\n{\n${text}\n}\n\n`;
                }
                this.#textContent = this.#textContent.trim();
                break;

            default:
                return;
        }

        const sp = scrollY;
        this.#textarea.style.height = '1px';
        this.#textarea.style.height = `${this.#textarea.scrollHeight}px`;
        document.documentElement.scrollTop = sp;
    }

    /** @type {File} */ #file;
    /** @type {String} */ #text;
    /** @type {HTMLTextAreaElement} */ #textarea;
}

/**
 * @param {File} file
 * @param {string} text
 */
dropzone.readAsText = (file, text) => {
    items.push(new Item(file, text));
};


if (location.host.indexOf('localhost') === 0) {
    for (const name of [
        'war3map.txt',
        'war3map.wts',
    ]) {
        const response = await fetch(`../examples/${name}`);
        const buffer = await response.text();
        dropzone.readAsText(new File([], name), buffer);
    }
}