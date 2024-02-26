/** @module MDX */

import {Geoset} from './data/Geoset/Geoset.mjs';
import {PivotPoint} from './data/PivotPoint.mjs';
import {Attachment} from './data/Attachment.mjs';
import {RibbonEmitter} from './data/RibbonEmitter.mjs';
import {EventObject} from './data/EventObject.mjs';
import {GeosetAnimation} from './data/GeosetAnimation.mjs';
import {NodeData} from './data/NodeData.mjs';
import {Bone} from './data/Bone.mjs';
import {CollisionShape} from './data/CollisionShape.mjs';
import {Texture} from './data/Texture.mjs';
import {TextureAnimation} from './data/TextureAnimation.mjs';
import {ParticleEmitter2} from './data/ParticleEmitter2.mjs';
import {ParticleEmitter} from './data/ParticleEmitter.mjs';
import {Camera} from './data/Camera.mjs';
import {Light} from './data/Light.mjs';
import {Version} from './data/Version.mjs';
import {Model} from './data/Model.mjs';
import {Sequence} from './data/Sequence.mjs';
import {GlobalSequence} from './data/GlobalSequence.mjs';
import {Material} from './data/Material.mjs';
import {CornEmmiter} from './data/CornEmmiter.mjs';
import {FaceEffect} from './data/FaceEffect.mjs';
import {BindPose} from './data/BindPose.mjs';
import {Info} from './data/Info.mjs';
import {Chunk} from './parser/Chunk.mjs';
import {CDataView} from '../utils/c-data-view.mjs';
import {CDataViewFake} from '../utils/c-data-view-fake.mjs';
import {Dec2RawLE} from '../rawcode/convert.mjs';

/**
 * @callback MDXOnError
 * @param {Error} error
 */

export class Vers {
    version = 800;
}

export class MDX {
    /** @param {ArrayBuffer} buffer */
    constructor(buffer) {
        this.buffer = buffer;
    }

    /** @type {Vers} */ vers = new Vers();
    /** @type {Error[]} */ errors = [];
    /** @type {Chunk[]} */ chunks = [];

    /** {@type {Chunk}} */ #geosets;

    /** @returns {Geoset[]} */
    get geosets() {
        return this.#geosets?.items;
    }

    /** {@type {Chunk}} */ #textures;

    /** @returns {Texture[]} */
    get textures() {
        return this.#textures?.items;
    }

    read() {
        const view = new CDataView(this.buffer);

        const k = view.uint32;
        if (k !== Chunk.MDLX_) this.errors.push(new Error(`Missing MDLX bytes in start of file!`));

        while (view.cursor < view.byteLength) {
            const key = view.uint32;
            let byteLength = view.uint32;

            const add = (parser, inclusive = false) => {
                const p = new Chunk(view.cursor, byteLength, key, this.buffer, parser, this.vers, inclusive);
                this.chunks.push(p);
                return p;
            };

            switch (key) {
                case Chunk.VERS:
                    this.version = add(Version);
                    break;
                case Chunk.INFO:
                    this.info = add(Info);
                    break;
                case Chunk.MODL:
                    this.model = add(Model);
                    break;
                case Chunk.SEQS:
                    this.sequences = add(Sequence);
                    break;
                case Chunk.MTLS:
                    this.materials = add(Material, true);
                    break;
                case Chunk.TEXS:
                    this.#textures = add(Texture);
                    break;
                case Chunk.GEOS:
                    this.#geosets = add(Geoset, true);
                    break;
                case Chunk.GEOA:
                    this.geosetAnimations = add(GeosetAnimation, true);
                    break;
                case Chunk.BONE:
                    this.bones = add(Bone);
                    break;
                case Chunk.ATCH:
                    this.attachments = add(Attachment, true);
                    break;
                case Chunk.PIVT:
                    this.pivotPoints = add(PivotPoint);
                    break;
                case Chunk.CORN:
                    this.cornEmmiter = add(CornEmmiter, true);
                    break;
                case Chunk.CAMS:
                    this.cameras = add(Camera, true);
                    break;
                case Chunk.EVTS:
                    this.eventObjects = add(EventObject);
                    break;
                case Chunk.CLID:
                    this.collisionShapes = add(CollisionShape);
                    break;
                case Chunk.FAFX:
                    this.faceEffect = add(FaceEffect);
                    break;
                case Chunk.BPOS:
                    this.bindPose = add(BindPose);
                    break;
                case Chunk.GLBS:
                    this.globalSequences = add(GlobalSequence);
                    break;
                case Chunk.LITE:
                    this.lights = add(Light, true);
                    break;
                case Chunk.HELP:
                    //FIXME add inclusive size
                    this.helpers = add(NodeData);
                    break;
                case Chunk.TXAN:
                    this.textureAnimations = add(TextureAnimation, true);
                    break;
                case Chunk.PREM:
                    this.particleEmitters = add(ParticleEmitter, true);
                    break;
                case Chunk.PRE2:
                    this.particleEmitters2 = add(ParticleEmitter2, true);
                    break;
                case Chunk.RIBB:
                    this.ribbinEmitters = add(RibbonEmitter, true);
                    break;
                default:
                    this.errors.push(new Error(`Missing chunk parser: ${Dec2RawLE(key)}`));
            }

            view.cursor += byteLength;
        }

        for (const c of this.chunks) {
            try {
                c.read();
            } catch (e) {
                this.errors.push(e);
            }
        }

        if (this.errors.length) console.warn(this.errors);
    }

    /**
     * @param {CDataView} view
     * @private
     */
    #write(view) {
        view.uint32 = Chunk.MDLX_;
        for (const c of this.chunks) {
            try {
                c.write(view);
            } catch (e) {
                console.log(e);
                this.errors.push(e);
            }
        }
    }

    write() {
        // noinspection JSValidateTypes
        /** @type {CDataView} */
        const dvw = new CDataViewFake();
        this.#write(dvw);

        const ab = new ArrayBuffer(dvw.cursor);
        const dv = new CDataView(ab);
        this.#write(dv);

        return ab;
    }

    toJSON() {
        return {
            version: this.version,
            model: this.model,
            info: this.info,
            sequences: this.sequences,
            globalSequences: this.globalSequences,
            materials: this.materials,
            textures: this.textures,
            geosets: this.geosets,
            bones: this.bones,
            helper: this.helpers,
            attachments: this.attachments,
            pivotPoints: this.pivotPoints,
            particleEmitters: this.particleEmitters,
            particleEmitters2: this.particleEmitters2,
            eventObjects: this.eventObjects,
            collisionShapes: this.collisionShapes,
            geosetAnimations: this.geosetAnimations,
            cornEmmiter: this.cornEmmiter,
            cameras: this.cameras,
            faceEffect: this.faceEffect,
            lights: this.lights,
            textureAnimations: this.textureAnimations,
            ribbinEmitters: this.ribbinEmitters,
            bindPose: this.bindPose,
        };
    }
}
