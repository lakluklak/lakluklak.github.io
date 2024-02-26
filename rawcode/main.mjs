import {RawcodeInput} from './components/rawcode-input.mjs';
import {Dec2RawBE, Raw2Dec, Raw2HexBE, HexBE2Raw, Dec2HexBE} from './convert.mjs';
import data from './data/data.mjs';

const container = document.createElement('div');
container.classList.add('container');
document.body.appendChild(container);

const raw = new RawcodeInput('raw', container);
const hex = new RawcodeInput('hex', container);
const dec = new RawcodeInput('dec', container);

const existsDiv = document.createElement('div');
existsDiv.classList.add('exists');
container.appendChild(existsDiv);

// raw
raw.input.addEventListener('update', () => {
    const string = raw.text;
    if (!raw.valid(string)) return;
    dec.text = Raw2Dec(string).toString();
    hex.text = Raw2HexBE(string);
    if (raw.valid(string)) {
        const exist = data[string];
        existsDiv.innerHTML = exist ? `<div class='exist-file'>${exist[0]}</div><div class='exist-raw'>${string}</div><div class='exist-name'>${exist[1]}</div>` : '';
    }
});

// hex
hex.input.addEventListener('update', () => {
    const string = hex.text;
    if (!hex.valid(string)) return;
    const _raw = HexBE2Raw(string);
    raw.text = _raw;
    dec.text = Raw2Dec(_raw).toString();
});

// num
dec.input.addEventListener('update', () => {
    const string = dec.text;
    if (!dec.valid(string)) return;
    const number = parseInt(string);
    raw.text = Dec2RawBE(number);
    hex.text = Dec2HexBE(number);
});

const popstate = () => {
    const text = window.location.hash.substring(1);
    if (!hex.valid(text)) return;
    hex.update(text, false);
    hex.dispatch();
    raw.dispatch();
};
popstate();
addEventListener('popstate', popstate);