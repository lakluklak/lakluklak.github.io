import {WTSString} from './WTSString.mjs';

export class WTS {

    /**
     * @param {string} text
     */
    constructor(text) {
        this.#text = text;
    }

    /** @type {string} */#text;
    /** @type {Error[]} */ errors = [];
    /** @type {WTSString[]} */ strings = [];

    read() {
        const list = this.#text.split('\n');

        let str = null;
        let open = false;
        const text = [];

        for (const s of list) {
            // comment
            if (s.match(/^\s*\/\//)) continue;
            // string number
            if (str === null) {
                const m = s.match(/^\s*STRING\s+(\d+)\s*$/);
                if (!m) continue;
                this.strings.push(str = new WTSString(+m[1]));
                continue;
            }

            // open
            if (!open) {
                if (s.trim() === '{') open = true;
                continue;
            }

            // close
            if (s.trim() === '}') {
                str.text = text.join('\n');
                str = null;
                text.length = 0;
                open = false;
                continue;
            }

            // add text
            text.push(s);
        }
    }

    /** @return {string} */
    toTXT() {
        const list = [];
        for (const s of this.strings){
            list.push(`${s.line}: ${s.text}`);
        }
        return list.join('\n\n');
    }
}