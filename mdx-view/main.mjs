import {vec3, mat4, quat} from './gl-matrix/index.mjs';
import {decodeDds, parseHeaders} from './utils/dds-parser.mjs';
import {parse as parseMDX} from './mdx/parse.mjs';
import {ModelRenderer} from './renderer/model-renderer.mjs';
import {vec3RotateZ} from './renderer/util.mjs';
import {decode, getImageData} from './blp/decode.mjs';
import {MDX} from '../mdx/MDX.mjs';

const canvas = document.getElementById('canvas');

let model;
let modelRenderer;
let gl;
const pMatrix = mat4.create();
const mvMatrix = mat4.create();
let ddsExt = null;
let rgtcExt = null;
let cameraTheta = Math.PI / 4;
let cameraPhi = 0;
let cameraDistance = 500;
let cameraTargetZ = 50;
let wireframe = false;
let showSkeleton = false;
let skeletonNodes = null;
const cameraBasePos = vec3.create();
const cameraPos = vec3.create();
const cameraPosTemp = vec3.create();
const cameraTarget = vec3.create();
const cameraUp = vec3.fromValues(0, 0, 1);
const cameraQuat = quat.create();
let start;

const updateModel = timestamp => {
    if (!start) start = timestamp;
    const delta = timestamp - start;
    start = timestamp;
    modelRenderer.update(delta);
};

const initGL = () => {
    if (gl) return;
    gl = canvas.getContext('webgl2', {
        antialias: true,
        alpha: false,
    });
    ddsExt = gl.getExtension('WEBGL_compressed_texture_s3tc');
    rgtcExt = gl.getExtension('EXT_texture_compression_rgtc');
    gl.clearColor(0.15, 0.15, 0.15, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
};

const cameraPosProjected = vec3.create();
const verticalQuat = quat.create();
const fromCameraBaseVec = vec3.fromValues(1, 0, 0);

const calcCameraQuat = () => {
    vec3.set(cameraPosProjected, cameraPos[0], cameraPos[1], 0);
    vec3.subtract(cameraPosTemp, cameraPos, cameraTarget);
    vec3.normalize(cameraPosProjected, cameraPosProjected);
    vec3.normalize(cameraPosTemp, cameraPosTemp);
    quat.rotationTo(cameraQuat, fromCameraBaseVec, cameraPosProjected);
    quat.rotationTo(verticalQuat, cameraPosProjected, cameraPosTemp);
    quat.mul(cameraQuat, verticalQuat, cameraQuat);
};

const drawScene = () => {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.depthMask(true);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(pMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 10000.0);
    vec3.set(
        cameraBasePos,
        Math.cos(cameraTheta) * Math.cos(cameraPhi) * cameraDistance,
        Math.cos(cameraTheta) * Math.sin(cameraPhi) * cameraDistance,
        Math.sin(cameraTheta) * cameraDistance,
    );
    cameraTarget[2] = cameraTargetZ;
    vec3RotateZ(cameraPos, cameraBasePos, window['angle'] || 0);
    mat4.lookAt(mvMatrix, cameraPos, cameraTarget, cameraUp);
    calcCameraQuat();
    modelRenderer.setCamera(cameraPos, cameraQuat);
    modelRenderer.render(mvMatrix, pMatrix, {
        wireframe,
    });
    if (showSkeleton) modelRenderer.renderSkeleton(mvMatrix, pMatrix, skeletonNodes);
};

const tick = timestamp => {
    requestAnimationFrame(tick);
    updateModel(timestamp);
    drawScene();
};

let started = false;

const handleLoadedTexture = () => {
    if (started) return;
    started = true;
    requestAnimationFrame(tick);
};

/** @param {MDX} mdx */
const processModelLoading = mdx => {
    modelRenderer = new ModelRenderer(mdx, model);
    modelRenderer.setTeamColor(parseColor(inputColor.value));
    initGL();
    modelRenderer.initGL(gl);
    setAnimationList();
};

const parseColor = value => {
    const val = value.slice(1);
    return vec3.fromValues(parseInt(val.slice(0, 2), 16) / 255, parseInt(val.slice(2, 4), 16) / 255, parseInt(val.slice(4, 6), 16) / 255);
};

const updateCanvasSize = () => {
    const width = canvas.parentElement.offsetWidth;
    const height = canvas.parentElement.offsetHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
};

const setAnimationList = () => {
    let list = model.Sequences.map(seq => seq.Name);
    if (list.length === 0) list = ['None'];
    const select = document.getElementById('select');
    select.innerHTML = '';
    list.forEach((item, index) => {
        const option = document.createElement('option');
        option.textContent = item;
        option.value = String(index);
        select.appendChild(option);
    });
    const skeleton = document.getElementById('skeleton');
    for (const node of model.Nodes) {
        if (node) {
            const option = document.createElement('option');
            option.textContent = node.Name;
            option.value = node.Name;
            skeleton.appendChild(option);
        }
    }
};

// ---- initControls();
const inputColor = document.getElementById('color');
inputColor.addEventListener('input', () => {
    modelRenderer.setTeamColor(parseColor(inputColor.value));
});
const select = document.getElementById('select');
select.addEventListener('input', () => {
    modelRenderer.setSequence(parseInt(select.value, 10));
});
const inputZ = document.getElementById('targetZ');
cameraTargetZ = parseInt(inputZ.value, 10);
inputZ.addEventListener('input', () => {
    cameraTargetZ = parseInt(inputZ.value, 10);
});
const inputDistance = document.getElementById('distance');
cameraDistance = parseInt(inputDistance.value, 10);
inputDistance.addEventListener('input', () => {
    cameraDistance = parseInt(inputDistance.value, 10);
});
const wireframeCheck = document.getElementById('wireframe');
wireframe = wireframeCheck.checked;
wireframeCheck.addEventListener('input', () => {
    wireframe = wireframeCheck.checked;
});
const readSkeletonNodes = value => {
    const val = value.trim();
    return val === '*' ? null : [val];
};
const skeleton = document.getElementById('skeleton');
skeletonNodes = readSkeletonNodes(skeleton.value);
skeleton.addEventListener('input', () => {
    skeletonNodes = readSkeletonNodes(skeleton.value);
});
const setShowSkeleton = val => {
    showSkeleton = val;
    skeleton.disabled = !val;
};
const skeletonCheck = document.getElementById('show_skeleton');
setShowSkeleton(skeletonCheck.checked);
skeletonCheck.addEventListener('input', () => {
    setShowSkeleton(skeletonCheck.checked);
});


// --- initCameraMove();
let down = false;
let downX, downY;

const coords = event => {
    const list = (event.changedTouches && event.changedTouches.length ? event.changedTouches : event.touches) || [event];
    return [list[0].pageX, list[0].pageY];
};

const updateCameraDistance = distance => {
    cameraDistance = distance;
    if (cameraDistance > 1000) cameraDistance = 1000;
    if (cameraDistance < 100) cameraDistance = 100;
    document.getElementById('distance').value = String(cameraDistance);
};

const pointerDown = event => {
    if (event.target !== canvas || event.button) return;
    down = true;
    [downX, downY] = coords(event);
};

const pointerMove = event => {
    if (!down) return;
    if (event.type === 'touchmove') event.preventDefault();
    if (event.changedTouches && event.changedTouches.length > 1 || event.touches && event.touches.length > 1) return;
    const [x, y] = coords(event);
    cameraPhi += -1 * (x - downX) * 0.01;
    cameraTheta += (y - downY) * 0.01;

    const cm = (Math.PI / 2) * 0.98;
    if (cameraTheta > cm) cameraTheta = cm;
    if (cameraTheta < 0) cameraTheta = 0;
    downX = x;
    downY = y;
};

const pointerUp = () => down = false;

let startCameraDistance;

document.addEventListener('mousedown', pointerDown);
document.addEventListener('touchstart', pointerDown);
document.addEventListener('mousemove', pointerMove);
document.addEventListener('touchmove', pointerMove);
document.addEventListener('mouseup', pointerUp);
document.addEventListener('touchend', pointerUp);
document.addEventListener('touchcancel', pointerUp);
document.addEventListener('wheel', event => updateCameraDistance(cameraDistance * (1 - event.deltaY / 600) ));
document.addEventListener('gesturestart', () => startCameraDistance = cameraDistance);
document.addEventListener('gesturechange', event => updateCameraDistance(startCameraDistance * (1 / event.scale)));

// --- initDragDrop();
const container = document.querySelector('.container');
let dropTarget;

container.addEventListener('dragenter', function onDragEnter(event) {
    let target = event.target;
    if (dropTarget && dropTarget !== event.target && dropTarget.classList) {
        dropTarget.classList.remove('drag_hovered');
    }
    if (!target.classList) target = target.parentElement;
    dropTarget = target;
    if (target && target.classList && target.classList.contains('drag')) {
        target.classList.add('drag_hovered');
    }
    container.classList.add('container_drag');
    event.preventDefault();
});

container.addEventListener('dragleave', function onDragLeave(event) {
    if (event.target === dropTarget) {
        container.classList.remove('container_drag');
        if (dropTarget && dropTarget.classList) {
            dropTarget.classList.remove('drag_hovered');
        }
    }
});
container.addEventListener('dragover', function onDragLeave(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
});

updateCanvasSize();
addEventListener('resize', updateCanvasSize);

/**
 * @param {Texture} texture
 * @param {ArrayBuffer} buffer
 * @param {boolean} isDDS
 * @param {boolean} isBLP
 * @return {Promise<unknown>}
 */
const dropTexture = (texture, buffer, isDDS, isBLP) =>
    new Promise(resolve => {
        if (isDDS) {
            const dds = parseHeaders(buffer);
            let format;
            switch (dds.format) {
                case 'dxt1':
                    format = ddsExt?.COMPRESSED_RGB_S3TC_DXT1_EXT;
                    break;
                case 'dxt3':
                    format = ddsExt?.COMPRESSED_RGBA_S3TC_DXT3_EXT;
                    break;
                case 'dxt5':
                    format = ddsExt?.COMPRESSED_RGBA_S3TC_DXT5_EXT;
                    break;
                case 'ati2':
                    format = rgtcExt?.COMPRESSED_RED_GREEN_RGTC2_EXT;
                    break;
            }
            if (format) modelRenderer.setTextureCompressedImage(texture, format, buffer, dds);
            else {
                const uint8 = new Uint8Array(buffer);
                const datas = dds.images
                    .filter(image => image.shape.width > 0 && image.shape.height > 0)
                    .map(image => {
                        const src = uint8.slice(image.offset, image.offset + image.length);
                        const rgba = decodeDds(src, dds.format, image.shape.width, image.shape.height);
                        return new ImageData(new Uint8ClampedArray(rgba), image.shape.width, image.shape.height);
                    });
                modelRenderer.setTextureImageData(texture, datas);
            }
            resolve();
        } else if (isBLP) {
            const blp = decode(buffer);
            modelRenderer.setTextureImageData(texture, blp.mipmaps.map((_mipmap, i) => getImageData(blp, i)));
            resolve();
        } else {
            const img = new Image();
            img.onload = () => {
                modelRenderer.setTextureImage(texture, img);
                resolve();
            };
            img.src = buffer;
        }
    });

// load
if (location.host.indexOf('localhost') === 0) {
    const name = [
        'Footman',
        'heroarchmage_hd',
    ][0];

    let response = await fetch(`./../models/${name}.mdx`);
    let buffer = await response.arrayBuffer();

    const mdx = new MDX(buffer);
    mdx.read();

    model = parseMDX(buffer);

    processModelLoading(mdx);
    handleLoadedTexture();

    for (const texture of mdx.textures) {
        if (texture.filename) {
            response = await fetch(`./../textures/data/${texture.filename.toLowerCase()}`);
            buffer = await response.arrayBuffer();
            await dropTexture(texture, buffer, false, true);
        }
    }

}
