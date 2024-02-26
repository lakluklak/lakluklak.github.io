// noinspection JSUnusedAssignment

import {DropZone} from '../components/drop-zone.mjs';
import {RibbonHeader} from '../components/ribbon-header.mjs';
import {WtsTranslate} from './components/wts-translate.mjs';
import {YaInput} from './components/ya-input.mjs';
import {CyberLink} from '../components/cyber-link.mjs';
import blobDownload from '../utils/blob-download.mjs';
import {WTS} from '../wts/WTS.mjs';

const dropzone = new DropZone();
dropzone.accept = '.wts';
document.body.appendChild(dropzone);

const ya = new YaInput();
document.body.appendChild(ya);

/**
 * @param {File} file
 * @param {string} text
 */
dropzone.readAsText = (file, text) => {

    RibbonHeader.fromText(file.name, document.body);

    const wts = new WTS(text);
    wts.read();

    /** @type {WtsTranslate[]} */ const list = [];

    for (const s of wts.strings) {
        const wts = new WtsTranslate(s, ya);
        list.push(wts);
        document.body.appendChild(wts);
        // noinspection JSIgnoredPromiseFromCall
        wts.send();
    }

    const b = new CyberLink();
    b.color = 'green';
    b.text = 'DOWNLOAD';
    b.onclick = () => {
        let out = '';
        for (const e of list) {
            out += `STRING ${e.string.line}\r\n{\r\n${e.translate}\r\n}\r\n\r\n`;
        }
        blobDownload(new Blob([out], {type: 'text/plain;charset=utf-8'}), 'translate.txt');
    };

    const buttons = document.createElement('div');
    buttons.appendChild(b);
    buttons.classList.add('buttons');
    buttons.style.display = 'flex';
    buttons.style.justifyContent = 'center';

    document.body.appendChild(buttons);
};


if (location.host.indexOf('localhost') === 0) {
    let name;
    name = 'war3map.wts';
    const response = await fetch(`files/${name}`);
    const buffer = await response.text();

    dropzone.readAsText(new File([], name), buffer);
}