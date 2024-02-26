/** @module MDX */
import {CDataView} from '../../utils/c-data-view.mjs';

export class Chunk {
    /** @type {Vers} */ vers;

    /**
     * @param {number} byteOffset
     * @param {number} byteLength
     * @param {number} key
     * @param {ArrayBuffer} buffer
     * @param child
     * @param {Vers} vers
     * @param {boolean} inclusive
     */
    constructor(byteOffset, byteLength, key, buffer, child, vers, inclusive) {
        this.key = key;
        this.view = new CDataView(buffer, byteOffset, byteLength);
        this.child = child;
        this.vers = vers;
        this.inclusive = inclusive;
    }

    items = [];

    /**
     * @param {DataView} view
     * @private
     */
    #read(view) {
        const parser = new this.child();
        parser.vers = this.vers;
        this.items.push(parser);
        parser.read(view);
    }

    read() {
        if (this.inclusive) {
            while (this.view.cursor < this.view.byteLength) {
                const size = this.view.uint32 - 4;
                if (size <= 0) {
                    throw new Error('Chunk inclusive size is 0!');
                }
                if (this.view.cursor + size > this.view.byteLength) {
                    throw new Error('Chunk inclusive size out of range!');
                }

                this.#read(new CDataView(this.view.buffer, this.view.byteOffset + this.view.cursor, size));

                this.view.cursor += size;
            }

            if (this.view.cursor !== this.view.byteLength) {
                throw new Error('Chunk inclusive wrong count!');
            }
            return;
        }

        while (this.view.cursor < this.view.byteLength) {
            const offset = this.view.cursor;

            this.#read(this.view);

            if (offset === this.view.cursor) {
                throw new Error('Chunk infinity read!');
            }
        }
    }

    /** @param {CDataView} view */
    write(view) {
        view.uint32 = this.key;
        const so = view.sizeOffset;
        for (const i of this.items) {
            if (this.inclusive) {
                const so = view.sizeOffset;
                (i.write ? i : i.parser).write(view);
                view.sizeOffsetInclusive = so;
            } else {
                (i.write ? i : i.parser).write(view);
            }
        }
        view.sizeOffsetExclusive = so;
    }


    static MDLX = 0x4d444c58;
    static MDLX_ = 0x584c444d;

    static INFO = 0x4f464e49;
    static VERS = 0x53524556;
    static MODL = 0x4c444f4d;
    static SEQS = 0x53514553;
    static TEXS = 0x53584554;
    static BONE = 0x454e4f42;
    static PIVT = 0x54564950;
    static GLBS = 0x53424c47;
    static HELP = 0x504c4548;
    static EVTS = 0x53545645;
    static CLID = 0x44494c43;
    static FAFX = 0x58464146;
    static KEVT = 0x5456454b;
    static BPOS = 0x534f5042;

    // Ribbon emitter
    static RIBB = 0x42424952;
    static KRVS = 0x5356524b; // float visibility
    static KRHA = 0x4148524b; // float heightAbove
    static KRHB = 0x4248524b; // float heightBelow
    static KRAL = 0x4c41524b; // float alpha
    static KRCO = 0x4f43524b; // float[3] color
    static KRTX = 0x5854524b; // uint32 textureSlot

    // Particle emitter
    static PREM = 0x4d455250;
    static KPEV = 0x5645504b; // float visibility
    static KPEE = 0x4545504b; // float emissionRate
    static KPEG = 0x4745504b; // float gravity
    static KPLN = 0x4e4c504b; // float longitude
    static KPLT = 0x544c504b; // float latitude
    static KPEL = 0x4c45504b; // float lifespan
    static KPES = 0x5345504b; // float speed

    // Particle emitter 2
    static PRE2 = 0x32455250;
    static KP2E = 0x4532504b; // float emissionRate
    static KP2G = 0x4732504b; // float gravity
    static KP2L = 0x4c32504b; // float latitude
    static KP2S = 0x5332504b; // float speed
    static KP2V = 0x5632504b; // float visibility
    static KP2R = 0x5232504b; // float variation
    static KP2N = 0x4e32504b; // float length
    static KP2W = 0x5732504b; // float width

    // Texture animation
    static TXAN = 0x4e415854;
    static KTAT = 0x5441544b; // float[3] translation
    static KTAR = 0x5241544b; // float[4] rotation
    static KTAS = 0x5341544b; // float[3] scaling

    // Light
    static LITE = 0x4554494c;
    static KLAS = 0x53414c4b; // float attenuationStart
    static KLAE = 0x45414c4b; // float attenuationStartEnd
    static KLAC = 0x43414c4b; // float[3] color
    static KLAI = 0x49414c4b; // float intensity
    static KLBI = 0x49424c4b; // float ambientIntensity
    static KLBC = 0x43424c4b; // float[3] ambientColor
    static KLAV = 0x56414c4b; // float visibility

    // Camera
    static CAMS = 0x534d4143;
    static KCRL = 0x4c52434b; // float rotation
    static KCTR = 0x5254434b; // float[3] translation
    static KTTR = 0x5254544b; // float[3] targetTranslation

    // Corn emitter
    static CORN = 0x4e524f43;
    static KPPA = 0x4150504b;// float alpha
    static KPPC = 0x4350504b;// float[3] color
    static KPPE = 0x4550504b;// float emissionRate
    static KPPL = 0x4c50504b;// float lifespan
    static KPPS = 0x5350504b;// float speed
    static KPPV = 0x5650504b;// float visibility

    // Node
    static KGTR = 0x5254474b; // float[3] translation
    static KGRT = 0x5452474b; // float[4] rotation
    static KGSC = 0x4353474b; // float[3] scaling

    // Material
    static MTLS = 0x534c544d;
    static LAYS = 0x5359414c;

    // Layer
    static KMTE = 0x45544d4b; // float emissiveGain
    static KMTF = 0x46544d4b; // uint32 textureId
    static KMTA = 0x41544d4b; // float alpha
    static KFC3 = 0x3343464b; // float[3] fresnelColor
    static KFCA = 0x4143464b; // float fresnelAlpha
    static KFTC = 0x4354464b; // float fresnelTeamColor

    // Geoset animation
    static GEOA = 0x414f4547;
    static KGAO = 0x4f41474b; // float alpha
    static KGAC = 0x4341474b; // float[3] color

    // Geoset
    static GEOS = 0x534f4547;
    static VRTX = 0x58545256;
    static NRMS = 0x534d524e;
    static PTYP = 0x50595450;
    static PCNT = 0x544e4350;
    static PVTX = 0x58545650;
    static GNDX = 0x58444e47;
    static MTGC = 0x4347544d;
    static MATS = 0x5354414d;
    static TANG = 0x474e4154;
    static SKIN = 0x4e494b53;
    static UVAS = 0x53415655;
    static UVBS = 0x53425655;

    // Attachment
    static ATCH = 0x48435441;
    static KATV = 0x5654414b; // float visibility

}