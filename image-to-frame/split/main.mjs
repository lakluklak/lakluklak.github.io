// noinspection JSUnusedAssignment,DuplicatedCode

import {DropZone} from "../../components/drop-zone.mjs";
import {GIF} from "../../gif/GIF.mjs";
import {RibbonHeader} from "../../components/ribbon-header.mjs";
import {InfoTable} from "./components/info-table.mjs";
import {InfoFrame} from "./components/info-frame.mjs";
import {ErrorMessage} from "../../components/error-message.mjs";
import {LineDivider} from "../../components/line-divider.mjs";

const dropzone = new DropZone();
dropzone.accept = '.gif';
document.body.appendChild(dropzone);


/**
 * @param {File} file
 * @param {ArrayBuffer} buffer
 * @return {Promise<void>}
 */
const addFile = async (file, buffer) => {
	const gif = new GIF(buffer);
	gif.parse();

	RibbonHeader.fromText(`${file.name} #${gif.frames.length} ${gif.width}x${gif.height}`, document.body);

	if (gif.errors.length) {
		ErrorMessage.fromErrors(gif.errors, document.body);
	}

	for (const frame of gif.frames) {
		const info = new InfoFrame();
		document.body.appendChild(info);

		info.size(gif.width, gif.height);

		const table = new InfoTable();
		table.header = `Frame ${frame.index}`;
		info.center = table;
		table.addRow('offset', `<b>${frame.x}</b>, <b>${frame.y}</b>`);
		table.addRow('size', `<b>${frame.width}</b>, <b>${frame.height}</b>`);
		table.addRow('disposal', `<b>${frame.disposal}</b> <i>${frame.disposalName}</i>`);
		table.addRow('delay', `<b>${frame.delay}</b><i>ms</i>`);

		info.left.border(frame.x, frame.y, frame.width, frame.height);

		info.left.loading = false;
		info.left.ctx.putImageData(frame.imageData, 0, 0);

		info.right.loading = false;
		info.right.ctx.putImageData(frame.imageDataFrame, 0, 0);

		const divider = new LineDivider();
		document.body.appendChild(divider);
	}

	const last = document.body.lastElementChild;
	if (last instanceof LineDivider) {
		last.remove();
	}
};

dropzone.addEventListener('bufferupload', async e => {
	const [file, buffer] = /** @type [File, ArrayBuffer] */ e.detail;
	await addFile(file, buffer);
});

if (location.host.indexOf('localhost') === 0) {
	let name;
	name = 'disposal2-2.gif';
	name = 'disposal2-1.gif';
	name = 'disposal3-1.gif';
	name = 'disposal3-2.gif';
	name = 'boobs2.gif';
	name = 'cat_walk.gif';
	name = 'kitagawa-marin.gif';
	const response = await fetch(`../images/${name}`);
	const buffer = await response.arrayBuffer();

	await addFile(new File([], name), buffer);
}