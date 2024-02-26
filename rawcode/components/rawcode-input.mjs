/**
 * @typedef {('raw'|'hex'|'dec')} RawcodeInputType
 */

export class RawcodeInput {
    /** @type {HTMLDivElement} */ #input;
    /** @type {HTMLElement} */ #prefix;
    #maxLength = 0;
    /** @type {RegExp} */ #colorRegExp;
    /** @type {RegExp} */ #validRegExp;
    /** @type {HTMLDivElement} */ #shadow;
    /** @type {RawcodeInputType} */ #type;

    /**
     * @param {RawcodeInputType} type
     * @param {HTMLElement} parent
     */
    constructor(type, parent) {
        this.#type = type;
        this.#shadow = document.createElement('div');
        this.#shadow.classList.add('rawcode-input');
        parent.appendChild(this.#shadow);

        const div = document.createElement('div');
        this.#shadow.appendChild(div);
        div.classList.add('rawcode-input_container');

        this.#input = document.createElement('div');
        div.appendChild(this.#input);

        // setting
        switch (type) {
            case 'raw':
                this.#maxLength = 4;
                this.#colorRegExp = /./g;
                this.#validRegExp = /^[\x00-\xFF]{4}$/;
                break;
            case 'hex':
                this.#maxLength = 8;
                this.prefix = '0x';
                this.#colorRegExp = /.{1,2}/g;
                this.#validRegExp = /^[0-9a-fA-F]{8}$/;
                break;
            case 'dec':
                this.#maxLength = 10;
                this.#validRegExp = /^[1-9]\d*$/;
                break;
        }

        this.#input.style.width = `calc(${this.#maxLength}ch + ${this.#maxLength} * var(--ils))`;

        // input
        this.#input.contentEditable = 'true';
        this.#input.spellcheck = false;
        this.#input.addEventListener('input', () => {
            this.#update();
            if (this.valid(this.text)) this.dispatch();
            this.#history();
        });

        // copy
        if (navigator?.clipboard?.writeText) {
            const copy = document.createElement('div');
            copy.classList.add('copy');
            copy.innerHTML = `<svg fill='#FFFFFF' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M0 0h24v24H0z' fill='none'/><path d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/></svg>`;
            this.#input.insertAdjacentElement('afterend', copy);
            copy.addEventListener('click', async () => {
                const text = `${this.#prefix ? this.#prefix.textContent : ''}${this.text}`;
                await navigator.clipboard.writeText(text).catch(() => true);
            });
        }
    }

    #update() {
        const preSel = getSelection();
        const preSeg = getTextSegments(this.#input);

        let absoluteAnchorIndex = null;
        let absoluteFocusIndex = null;
        let currentIndex = 0;

        preSeg.forEach(({text, node}) => {
            if (node === preSel.anchorNode) absoluteAnchorIndex = currentIndex + preSel.anchorOffset;
            if (node === preSel.focusNode) absoluteFocusIndex = currentIndex + preSel.focusOffset;
            currentIndex += text.length;
        });

        // render text
        let textContent = this.#input.textContent;
        if (this.#maxLength) textContent = textContent.slice(0, this.#maxLength);
        if (this.#colorRegExp) {
            const matches = textContent.match(this.#colorRegExp) ?? [];
            let textContentNew = '';

            const list = ['#e11ccd', '#11e034', '#fbde14', '#c20909'];

            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                textContentNew += `<span style='color:${list[i % list.length]}'>${match}</span>`;
            }

            this.#input.innerHTML = textContentNew;
        } else {
            this.#input.innerHTML = textContent;
        }

        // restore selection
        if (this.#input !== document.activeElement) return;

        const newSel = getSelection();
        const newSeg = getTextSegments(this.#input);

        let anchorNode = this.#input;
        let anchorIndex = 0;
        let focusNode = this.#input;
        let focusIndex = 0;
        let currentIndexN = 0;
        newSeg.forEach(({text, node}) => {
            const startIndexOfNode = currentIndexN;
            const endIndexOfNode = startIndexOfNode + text.length;
            if (startIndexOfNode <= absoluteAnchorIndex && absoluteAnchorIndex <= endIndexOfNode) {
                anchorNode = node;
                anchorIndex = absoluteAnchorIndex - startIndexOfNode;
            }
            if (startIndexOfNode <= absoluteFocusIndex && absoluteFocusIndex <= endIndexOfNode) {
                focusNode = node;
                focusIndex = absoluteFocusIndex - startIndexOfNode;
            }
            currentIndexN += text.length;
        });

        if (this.#maxLength && anchorNode === focusNode && focusNode === this.#input && this.#input.textContent.length) {
            newSel.selectAllChildren(this.#input);
            newSel.collapseToEnd();
            return;
        }

        newSel.setBaseAndExtent(anchorNode, anchorIndex, focusNode, focusIndex);
    }

    dispatch() {
        const event = new Event('update', {bubbles: true});
        this.#input.dispatchEvent(event);
    }

    /** @param {string} text */
    set text(text) {
        this.update(text, true);
    }

    /** @param {string} text
     * @param {boolean} history
     */
    update(text, history) {
        this.#input.textContent = text;
        this.#update();
        if (history) this.#history();
    }

    /** @return {string} */
    get text() {
        return this.#input.textContent;
    }

    /** @return {HTMLDivElement} */
    get input() {
        return this.#input;
    }

    #history() {
        const text = this.text;
        if (this.#type !== 'hex' || !this.valid(text)) return;
        history.pushState({}, '', `#${text}`);
    }

    /**
     * @param {string} text
     * @return {boolean}
     */
    valid(text) {
        return this.#validRegExp.test(text);
    }

    set prefix(text) {
        if (!this.#prefix) {
            this.#prefix = document.createElement('div');
            this.#prefix.classList.add('prefix');
            this.#input.insertAdjacentElement('beforebegin', this.#prefix);
        }
        this.#prefix.textContent = text;
    }
}

const getTextSegments = element => {
    const textSegments = [];
    Array.from(element.childNodes).forEach((node) => {
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                textSegments.push({text: node.nodeValue, node});
                break;

            case Node.ELEMENT_NODE:
                textSegments.splice(textSegments.length, 0, ...(getTextSegments(node)));
                break;

            default:
                throw new Error(`Unexpected node type: ${node.nodeType}`);
        }
    });
    return textSegments;
};