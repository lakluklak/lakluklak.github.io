import {LineType, CollisionShapeType, ParticleEmitter2FramesFlags, AnimVectorType} from '../model.mjs';
import parseNode from './parser/parse-node.mjs';

const BIG_ENDIAN = true;
const NONE = -1;

const animVectorSize = {
    [AnimVectorType.INT1]: 1,
    [AnimVectorType.FLOAT1]: 1,
    [AnimVectorType.FLOAT3]: 3,
    [AnimVectorType.FLOAT4]: 4,
};

class State {
    // pos in bytes
    pos;
    length;
    ab;
    view;
    uint;

    constructor(arrayBuffer) {
        this.ab = arrayBuffer;
        this.pos = 0;
        this.length = arrayBuffer.byteLength;
        this.view = new DataView(this.ab);
        this.uint = new Uint8Array(this.ab);
    }

    keyword() {
        const res = String.fromCharCode(this.uint[this.pos], this.uint[this.pos + 1], this.uint[this.pos + 2], this.uint[this.pos + 3]);
        this.pos += 4;
        return res;
    }

    expectKeyword(keyword, errorText) {
        const curKeyword = this.keyword();
        if (curKeyword !== keyword) {
            throw new Error(errorText);
        }
    }

    uint8() {
        return this.view.getUint8(this.pos++);
    }

    uint16() {
        const res = this.view.getUint16(this.pos, BIG_ENDIAN);
        this.pos += 2;
        return res;
    }

    int32() {
        const res = this.view.getInt32(this.pos, BIG_ENDIAN);
        this.pos += 4;
        return res;
    }

    float32() {
        const res = this.view.getFloat32(this.pos, BIG_ENDIAN);
        this.pos += 4;
        return res;
    }

    float32Array(len) {
        const res = new Float32Array(len);
        for (let i = 0; i < len; ++i) {
            res[i] = this.float32();
        }
        return res;
    }

    uint8Array(len) {
        const res = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
            res[i] = this.uint8();
        }
        return res;
    }

    str(length) {
        // actual string length
        // data may consist of ['a', 'b', 'c', 0, 0, 0]
        let stringLength = length;
        while (this.uint[this.pos + stringLength - 1] === 0 && stringLength > 0) {
            --stringLength;
        }
        // ??
        // TS2461:Type 'Uint8Array' is not an array type.
        // let res = String.fromCharCode(...this.uint.slice(this.pos, this.pos + length));
        // eslint-disable-next-line prefer-spread
        const res = String.fromCharCode.apply(String, this.uint.slice(this.pos, this.pos + stringLength));
        this.pos += length;
        return res;
    }

    animVector(type) {
        const res = {
            Keys: [],
        };
        const isInt = type === AnimVectorType.INT1;
        const vectorSize = animVectorSize[type];
        const keysCount = this.int32();
        res.LineType = this.int32();
        res.GlobalSeqId = this.int32();
        if (res.GlobalSeqId === NONE) {
            res.GlobalSeqId = null;
        }
        for (let i = 0; i < keysCount; ++i) {
            const animKeyFrame = {};
            animKeyFrame.Frame = this.int32();
            animKeyFrame.Vector = isInt ? new Int32Array(vectorSize) : new Float32Array(vectorSize);
            for (let j = 0; j < vectorSize; ++j) {
                animKeyFrame.Vector[j] = isInt ? this.int32() : this.float32();
            }
            if (res.LineType === LineType.Hermite || res.LineType === LineType.Bezier) {
                for (const part of ['InTan', 'OutTan']) {
                    animKeyFrame[part] = new Float32Array(vectorSize);
                    for (let j = 0; j < vectorSize; ++j) {
                        animKeyFrame[part][j] = isInt ? this.int32() : this.float32();
                    }
                }
            }
            res.Keys.push(animKeyFrame);
        }
        return res;
    }
}

function parseExtent(obj, state) {
    obj.BoundsRadius = state.float32();
    for (const key of ['MinimumExtent', 'MaximumExtent']) {
        obj[key] = new Float32Array(3);
        for (let i = 0; i < 3; ++i) {
            obj[key][i] = state.float32();
        }
    }
}

function parseVersion(model, state) {
    model.Version = state.int32();
}

const MODEL_NAME_LENGTH = 0x150;

function parseModelInfo(model, state) {
    model.Info.Name = state.str(MODEL_NAME_LENGTH);
    state.int32(); // unknown 4-byte sequence
    parseExtent(model.Info, state);
    model.Info.BlendTime = state.int32();
}

const MODEL_SEQUENCE_NAME_LENGTH = 0x50;

function parseSequences(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const name = state.str(MODEL_SEQUENCE_NAME_LENGTH);
        const sequence = {};
        sequence.Name = name;
        const interval = new Uint32Array(2);
        interval[0] = state.int32();
        interval[1] = state.int32();
        sequence.Interval = interval;
        sequence.MoveSpeed = state.float32();
        sequence.NonLooping = state.int32() > 0;
        sequence.Rarity = state.float32();
        state.int32(); // unknown 4-byte sequence (syncPoint?)
        parseExtent(sequence, state);
        model.Sequences.push(sequence);
    }
}

function parseMaterials(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        state.int32(); // material size inclusive
        const material = {
            Layers: [],
        };
        material.PriorityPlane = state.int32();
        material.RenderMode = state.int32();
        if (model.Version >= 900) {
            material.Shader = state.str(80);
        }
        state.expectKeyword('LAYS', 'Incorrect materials format');
        const layersCount = state.int32();
        for (let i = 0; i < layersCount; ++i) {
            const startPos2 = state.pos;
            const size2 = state.int32();
            const layer = {};
            layer.FilterMode = state.int32();
            layer.Shading = state.int32();
            layer.TextureID = state.int32();
            layer.TVertexAnimId = state.int32();
            if (layer.TVertexAnimId === NONE) layer.TVertexAnimId = null;
            layer.CoordId = state.int32();
            layer.Alpha = state.float32();
            if (model.Version >= 900) {
                layer.EmissiveGain = state.float32();
                if (model.Version >= 1000) {
                    layer.FresnelColor = state.float32Array(3);
                    layer.FresnelOpacity = state.float32();
                    layer.FresnelTeamColor = state.float32();
                }
            }
            while (state.pos < startPos2 + size2) {
                const keyword = state.keyword();
                if (keyword === 'KMTA') layer.Alpha = state.animVector(AnimVectorType.FLOAT1);
                else if (keyword === 'KMTF') layer.TextureID = state.animVector(AnimVectorType.INT1);
                else if (keyword === 'KMTE' && model.Version >= 900) layer.EmissiveGain = state.animVector(AnimVectorType.FLOAT1);
                else if (keyword === 'KFC3' && model.Version >= 1000) layer.FresnelColor = state.animVector(AnimVectorType.FLOAT3);
                else if (keyword === 'KFCA' && model.Version >= 1000) layer.FresnelOpacity = state.animVector(AnimVectorType.FLOAT1);
                else if (keyword === 'KFTC' && model.Version >= 1000) layer.FresnelTeamColor = state.animVector(AnimVectorType.FLOAT1);
                else throw new Error('Unknown layer chunk data ' + keyword);
            }
            material.Layers.push(layer);
        }
        model.Materials.push(material);
    }
}

const MODEL_TEXTURE_PATH_LENGTH = 0x100;

function parseTextures(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const texture = {};
        texture.ReplaceableId = state.int32();
        texture.Image = state.str(MODEL_TEXTURE_PATH_LENGTH);
        state.int32(); // unknown 4-byte sequence
        texture.Flags = state.int32();
        model.Textures.push(texture);
    }
}

function parseGeosets(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const geoset = {};
        state.int32(); // geoset size, not used
        state.expectKeyword('VRTX', 'Incorrect geosets format');
        const verticesCount = state.int32();
        geoset.Vertices = new Float32Array(verticesCount * 3);
        for (let i = 0; i < verticesCount * 3; ++i) {
            geoset.Vertices[i] = state.float32();
        }
        state.expectKeyword('NRMS', 'Incorrect geosets format');
        const normalsCount = state.int32();
        geoset.Normals = new Float32Array(normalsCount * 3);
        for (let i = 0; i < normalsCount * 3; ++i) {
            geoset.Normals[i] = state.float32();
        }
        state.expectKeyword('PTYP', 'Incorrect geosets format');
        const primitiveCount = state.int32();
        for (let i = 0; i < primitiveCount; ++i) {
            if (state.int32() !== 4) {
                throw new Error('Incorrect geosets format');
            }
        }
        state.expectKeyword('PCNT', 'Incorrect geosets format');
        const faceGroupCount = state.int32();
        for (let i = 0; i < faceGroupCount; ++i) {
            state.int32();
        }
        state.expectKeyword('PVTX', 'Incorrect geosets format');
        const indicesCount = state.int32();
        geoset.Faces = new Uint16Array(indicesCount);
        for (let i = 0; i < indicesCount; ++i) {
            geoset.Faces[i] = state.uint16();
        }
        state.expectKeyword('GNDX', 'Incorrect geosets format');
        const verticesGroupCount = state.int32();
        geoset.VertexGroup = new Uint8Array(verticesGroupCount);
        for (let i = 0; i < verticesGroupCount; ++i) {
            geoset.VertexGroup[i] = state.uint8();
        }
        state.expectKeyword('MTGC', 'Incorrect geosets format');
        const groupsCount = state.int32();
        geoset.Groups = [];
        for (let i = 0; i < groupsCount; ++i) {
            // new Array(array length)
            geoset.Groups[i] = new Array(state.int32());
        }
        state.expectKeyword('MATS', 'Incorrect geosets format');
        geoset.TotalGroupsCount = state.int32();
        let groupIndex = 0;
        let groupCounter = 0;
        for (let i = 0; i < geoset.TotalGroupsCount; ++i) {
            if (groupIndex >= geoset.Groups[groupCounter].length) {
                groupIndex = 0;
                groupCounter++;
            }
            geoset.Groups[groupCounter][groupIndex++] = state.int32();
        }
        geoset.MaterialID = state.int32();
        geoset.SelectionGroup = state.int32();
        geoset.Unselectable = state.int32() > 0;
        if (model.Version >= 900) {
            geoset.LevelOfDetail = state.int32();
            geoset.Name = state.str(80);
        }
        parseExtent(geoset, state);
        const geosetAnimCount = state.int32();
        geoset.Anims = [];
        for (let i = 0; i < geosetAnimCount; ++i) {
            const geosetAnim = {};
            parseExtent(geosetAnim, state);
            geoset.Anims.push(geosetAnim);
        }
        let keyword = state.keyword();
        if (model.Version >= 900) {
            // eslint-disable-next-line no-constant-condition
            while (1) {
                if (state.pos >= state.length) throw new Error('Unexpected EOF');
                if (keyword === 'TANG') {
                    if (geoset.Tangents) throw new Error('Incorrect geoset, multiple Tangents');
                    const len = state.int32();
                    geoset.Tangents = state.float32Array(len * 4);
                } else if (keyword === 'SKIN') {
                    if (geoset.SkinWeights) throw new Error('Incorrect geoset, multiple SkinWeights');
                    const len = state.int32();
                    geoset.SkinWeights = state.uint8Array(len);
                } else if (keyword === 'UVAS') {
                    break;
                }
                keyword = state.keyword();
            }
        } else if (keyword !== 'UVAS') throw new Error('Incorrect geosets format');
        const textureChunkCount = state.int32();
        geoset.TVertices = [];
        for (let i = 0; i < textureChunkCount; ++i) {
            state.expectKeyword('UVBS', 'Incorrect geosets format');
            const textureCoordsCount = state.int32();
            const tvertices = new Float32Array(textureCoordsCount * 2);
            for (let j = 0; j < textureCoordsCount * 2; ++j) {
                tvertices[j] = state.float32();
            }
            geoset.TVertices.push(tvertices);
        }
        model.Geosets.push(geoset);
    }
}

function parseGeosetAnims(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const animStartPos = state.pos;
        const animSize = state.int32();
        const geosetAnim = {};
        geosetAnim.Alpha = state.float32();
        geosetAnim.Flags = state.int32();
        geosetAnim.Color = new Float32Array(3);
        for (let i = 0; i < 3; ++i) {
            geosetAnim.Color[i] = state.float32();
        }
        geosetAnim.GeosetId = state.int32();
        if (geosetAnim.GeosetId === NONE) {
            geosetAnim.GeosetId = null;
        }
        while (state.pos < animStartPos + animSize) {
            const keyword = state.keyword();
            if (keyword === 'KGAO') geosetAnim.Alpha = state.animVector(AnimVectorType.FLOAT1);
            else if (keyword === 'KGAC') geosetAnim.Color = state.animVector(AnimVectorType.FLOAT3);
            else throw new Error('Incorrect GeosetAnim chunk data ' + keyword);
        }
        model.GeosetAnims.push(geosetAnim);
    }
}

function parseBones(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const bone = {};
        parseNode(model, bone, state);
        bone.GeosetId = state.int32();
        if (bone.GeosetId === NONE) bone.GeosetId = null;
        bone.GeosetAnimId = state.int32();
        if (bone.GeosetAnimId === NONE) bone.GeosetAnimId = null;
        model.Bones.push(bone);
    }
}

function parseHelpers(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const helper = {};
        parseNode(model, helper, state);
        model.Helpers.push(helper);
    }
}

const MODEL_ATTACHMENT_PATH_LENGTH = 0x100;

function parseAttachments(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const attachmentStart = state.pos;
        const attachmentSize = state.int32();
        const attachment = {};
        parseNode(model, attachment, state);
        attachment.Path = state.str(MODEL_ATTACHMENT_PATH_LENGTH);
        state.int32(); // unknown 4-byte
        attachment.AttachmentID = state.int32();
        if (state.pos < attachmentStart + attachmentSize) {
            state.expectKeyword('KATV', 'Incorrect attachment chunk data');
            attachment.Visibility = state.animVector(AnimVectorType.FLOAT1);
        }
        model.Attachments.push(attachment);
    }
}

function parsePivotPoints(model, state, size) {
    const pointsCount = size / (4 * 3);
    for (let i = 0; i < pointsCount; ++i) {
        model.PivotPoints[i] = new Float32Array(3);
        model.PivotPoints[i][0] = state.float32();
        model.PivotPoints[i][1] = state.float32();
        model.PivotPoints[i][2] = state.float32();
    }
}

function parseEventObjects(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const eventObject = {};
        parseNode(model, eventObject, state);
        state.expectKeyword('KEVT', 'Incorrect EventObject chunk data');
        const eventTrackCount = state.int32();
        eventObject.EventTrack = new Uint32Array(eventTrackCount);
        state.int32(); // unused 4-byte?
        for (let i = 0; i < eventTrackCount; ++i) {
            eventObject.EventTrack[i] = state.int32();
        }
        model.EventObjects.push(eventObject);
    }
}

function parseCollisionShapes(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const collisionShape = {};
        parseNode(model, collisionShape, state);
        collisionShape.Shape = state.int32();
        if (collisionShape.Shape === CollisionShapeType.Box) {
            collisionShape.Vertices = new Float32Array(6);
        } else {
            collisionShape.Vertices = new Float32Array(3);
        }
        for (let i = 0; i < collisionShape.Vertices.length; ++i) {
            collisionShape.Vertices[i] = state.float32();
        }
        if (collisionShape.Shape === CollisionShapeType.Sphere) {
            collisionShape.BoundsRadius = state.float32();
        }
        model.CollisionShapes.push(collisionShape);
    }
}

function parseGlobalSequences(model, state, size) {
    const startPos = state.pos;
    model.GlobalSequences = [];
    while (state.pos < startPos + size) {
        model.GlobalSequences.push(state.int32());
    }
}

const MODEL_PARTICLE_EMITTER_PATH_LENGTH = 0x100;

function parseParticleEmitters(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const emitterStart = state.pos;
        const emitterSize = state.int32();
        const emitter = {};
        parseNode(model, emitter, state);
        emitter.EmissionRate = state.float32();
        emitter.Gravity = state.float32();
        emitter.Longitude = state.float32();
        emitter.Latitude = state.float32();
        emitter.Path = state.str(MODEL_PARTICLE_EMITTER_PATH_LENGTH);
        state.int32();
        emitter.LifeSpan = state.float32();
        emitter.InitVelocity = state.float32();
        while (state.pos < emitterStart + emitterSize) {
            const keyword = state.keyword();
            if (keyword === 'KPEV') {
                emitter.Visibility = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPEE') {
                emitter.EmissionRate = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPEG') {
                emitter.Gravity = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPLN') {
                emitter.Longitude = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPLT') {
                emitter.Latitude = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPEL') {
                emitter.LifeSpan = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPES') {
                emitter.InitVelocity = state.animVector(AnimVectorType.FLOAT1);
            } else {
                throw new Error('Incorrect particle emitter chunk data ' + keyword);
            }
        }
        model.ParticleEmitters.push(emitter);
    }
}

function parseParticleEmitters2(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const emitterStart = state.pos;
        const emitterSize = state.int32();
        const emitter = {};
        parseNode(model, emitter, state);
        emitter.Speed = state.float32();
        emitter.Variation = state.float32();
        emitter.Latitude = state.float32();
        emitter.Gravity = state.float32();
        emitter.LifeSpan = state.float32();
        emitter.EmissionRate = state.float32();
        emitter.Width = state.float32();
        emitter.Length = state.float32();
        emitter.FilterMode = state.int32();
        emitter.Rows = state.int32();
        emitter.Columns = state.int32();
        const frameFlags = state.int32();
        emitter.FrameFlags = 0;
        if (frameFlags === 0 || frameFlags === 2) {
            emitter.FrameFlags |= ParticleEmitter2FramesFlags.Head;
        }
        if (frameFlags === 1 || frameFlags === 2) {
            emitter.FrameFlags |= ParticleEmitter2FramesFlags.Tail;
        }
        emitter.TailLength = state.float32();
        emitter.Time = state.float32();
        emitter.SegmentColor = [];
        // always 3 segments
        for (let i = 0; i < 3; ++i) {
            emitter.SegmentColor[i] = new Float32Array(3);
            //  rgb order, inverse from mdl
            for (let j = 0; j < 3; ++j) {
                emitter.SegmentColor[i][j] = state.float32();
            }
        }
        emitter.Alpha = new Uint8Array(3);
        for (let i = 0; i < 3; ++i) {
            emitter.Alpha[i] = state.uint8();
        }
        emitter.ParticleScaling = new Float32Array(3);
        for (let i = 0; i < 3; ++i) {
            emitter.ParticleScaling[i] = state.float32();
        }
        for (const part of ['LifeSpanUVAnim', 'DecayUVAnim', 'TailUVAnim', 'TailDecayUVAnim']) {
            emitter[part] = new Uint32Array(3);
            for (let i = 0; i < 3; ++i) {
                emitter[part][i] = state.int32();
            }
        }
        emitter.TextureID = state.int32();
        if (emitter.TextureID === NONE) {
            emitter.TextureID = null;
        }
        emitter.Squirt = state.int32() > 0;
        emitter.PriorityPlane = state.int32();
        emitter.ReplaceableId = state.int32();
        while (state.pos < emitterStart + emitterSize) {
            const keyword = state.keyword();
            if (keyword === 'KP2V') {
                emitter.Visibility = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KP2E') {
                emitter.EmissionRate = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KP2W') {
                emitter.Width = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KP2N') {
                emitter.Length = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KP2S') {
                emitter.Speed = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KP2L') {
                emitter.Latitude = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KP2G') {
                emitter.Gravity = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KP2R') {
                emitter.Variation = state.animVector(AnimVectorType.FLOAT1);
            } else {
                throw new Error('Incorrect particle emitter2 chunk data ' + keyword);
            }
        }
        model.ParticleEmitters2.push(emitter);
    }
}

const MODEL_CAMERA_NAME_LENGTH = 0x50;

function parseCameras(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const cameraStart = state.pos;
        const cameraSize = state.int32();
        const camera = {};
        camera.Name = state.str(MODEL_CAMERA_NAME_LENGTH);
        camera.Position = new Float32Array(3);
        camera.Position[0] = state.float32();
        camera.Position[1] = state.float32();
        camera.Position[2] = state.float32();
        camera.FieldOfView = state.float32();
        camera.FarClip = state.float32();
        camera.NearClip = state.float32();
        camera.TargetPosition = new Float32Array(3);
        camera.TargetPosition[0] = state.float32();
        camera.TargetPosition[1] = state.float32();
        camera.TargetPosition[2] = state.float32();
        while (state.pos < cameraStart + cameraSize) {
            const keyword = state.keyword();
            if (keyword === 'KCTR') {
                camera.Translation = state.animVector(AnimVectorType.FLOAT3);
            } else if (keyword === 'KTTR') {
                camera.TargetTranslation = state.animVector(AnimVectorType.FLOAT3);
            } else if (keyword === 'KCRL') {
                camera.Rotation = state.animVector(AnimVectorType.FLOAT1);
            } else {
                throw new Error('Incorrect camera chunk data ' + keyword);
            }
        }
        model.Cameras.push(camera);
    }
}

function parseLights(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const lightStart = state.pos;
        const lightSize = state.int32();
        const light = {};
        parseNode(model, light, state);
        light.LightType = state.int32();
        light.AttenuationStart = state.float32();
        light.AttenuationEnd = state.float32();
        light.Color = new Float32Array(3);
        //  rgb order, inverse from mdl
        for (let j = 0; j < 3; ++j) {
            light.Color[j] = state.float32();
        }
        light.Intensity = state.float32();
        light.AmbColor = new Float32Array(3);
        //  rgb order, inverse from mdl
        for (let j = 0; j < 3; ++j) {
            light.AmbColor[j] = state.float32();
        }
        light.AmbIntensity = state.float32();
        while (state.pos < lightStart + lightSize) {
            const keyword = state.keyword();
            if (keyword === 'KLAV') {
                light.Visibility = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KLAC') {
                light.Color = state.animVector(AnimVectorType.FLOAT3);
            } else if (keyword === 'KLAI') {
                light.Intensity = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KLBC') {
                light.AmbColor = state.animVector(AnimVectorType.FLOAT3);
            } else if (keyword === 'KLBI') {
                light.AmbIntensity = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KLAS') {
                light.AttenuationStart = state.animVector(AnimVectorType.INT1);
            } else if (keyword === 'KLAE') {
                light.AttenuationEnd = state.animVector(AnimVectorType.INT1);
            } else {
                throw new Error('Incorrect light chunk data ' + keyword);
            }
        }
        model.Lights.push(light);
    }
}

function parseTextureAnims(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const animStart = state.pos;
        const animSize = state.int32();
        const anim = {};
        while (state.pos < animStart + animSize) {
            const keyword = state.keyword();
            if (keyword === 'KTAT') {
                anim.Translation = state.animVector(AnimVectorType.FLOAT3);
            } else if (keyword === 'KTAR') {
                anim.Rotation = state.animVector(AnimVectorType.FLOAT4);
            } else if (keyword === 'KTAS') {
                anim.Scaling = state.animVector(AnimVectorType.FLOAT3);
            } else {
                throw new Error('Incorrect light chunk data ' + keyword);
            }
        }
        model.TextureAnims.push(anim);
    }
}

function parseRibbonEmitters(model, state, size) {
    const startPos = state.pos;
    while (state.pos < startPos + size) {
        const emitterStart = state.pos;
        const emitterSize = state.int32();
        const emitter = {};
        parseNode(model, emitter, state);
        emitter.HeightAbove = state.float32();
        emitter.HeightBelow = state.float32();
        emitter.Alpha = state.float32();
        emitter.Color = new Float32Array(3);
        //  rgb order, inverse from mdl
        for (let j = 0; j < 3; ++j) {
            emitter.Color[j] = state.float32();
        }
        emitter.LifeSpan = state.float32();
        emitter.TextureSlot = state.int32();
        emitter.EmissionRate = state.int32();
        emitter.Rows = state.int32();
        emitter.Columns = state.int32();
        emitter.MaterialID = state.int32();
        emitter.Gravity = state.float32();
        while (state.pos < emitterStart + emitterSize) {
            const keyword = state.keyword();
            if (keyword === 'KRVS') {
                emitter.Visibility = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KRHA') {
                emitter.HeightAbove = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KRHB') {
                emitter.HeightBelow = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KRAL') {
                emitter.Alpha = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KRTX') {
                emitter.TextureSlot = state.animVector(AnimVectorType.INT1);
            } else {
                throw new Error('Incorrect ribbon emitter chunk data ' + keyword);
            }
        }
        model.RibbonEmitters.push(emitter);
    }
}

function parseFaceFX(model, state, size) {
    if (model.Version < 900) {
        throw new Error('Mismatched version chunk');
    }
    const startPos = state.pos;
    model.FaceFX = model.FaceFX || [];
    while (state.pos < startPos + size) {
        const faceFX = {
            Name: '',
            Path: '',
        };
        faceFX.Name = state.str(80);
        faceFX.Path = state.str(260);
        model.FaceFX.push(faceFX);
    }
}

function parseBindPose(model, state, size) {
    if (model.Version < 900) {
        throw new Error('Mismatched version chunk');
    }
    const startPos = state.pos;
    model.BindPoses = model.BindPoses || [];
    const len = state.int32();
    const bindPose = {
        Matrices: [],
    };
    for (let i = 0; i < len; ++i) {
        const matrix = state.float32Array(12);
        bindPose.Matrices.push(matrix);
    }
    model.BindPoses.push(bindPose);
    if (state.pos !== startPos + size) {
        throw new Error('Mismatched BindPose data');
    }
}

function parseParticleEmitterPopcorn(model, state, size) {
    if (model.Version < 900) {
        throw new Error('Mismatched version chunk');
    }
    const startPos = state.pos;
    model.ParticleEmitterPopcorns = model.ParticleEmitterPopcorns || [];
    while (state.pos < startPos + size) {
        const emitterStart = state.pos;
        const emitterSize = state.int32();
        const emitter = {};
        parseNode(model, emitter, state);
        emitter.LifeSpan = state.float32();
        emitter.EmissionRate = state.float32();
        emitter.Speed = state.float32();
        emitter.Color = state.float32Array(3);
        emitter.Alpha = state.float32();
        emitter.ReplaceableId = state.int32();
        emitter.Path = state.str(260);
        emitter.AnimVisibilityGuide = state.str(260);
        while (state.pos < emitterStart + emitterSize) {
            const keyword = state.keyword();
            if (keyword === 'KPPA') {
                emitter.Alpha = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPPC') {
                emitter.Color = state.animVector(AnimVectorType.FLOAT3);
            } else if (keyword === 'KPPE') {
                emitter.EmissionRate = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPPL') {
                emitter.LifeSpan = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPPS') {
                emitter.Speed = state.animVector(AnimVectorType.FLOAT1);
            } else if (keyword === 'KPPV') {
                emitter.Visibility = state.animVector(AnimVectorType.FLOAT1);
            } else {
                throw new Error('Incorrect particle emitter popcorn chunk data ' + keyword);
            }
        }
        model.ParticleEmitterPopcorns.push(emitter);
    }
}

const parsers = {
    VERS: parseVersion,
    MODL: parseModelInfo,
    SEQS: parseSequences,
    MTLS: parseMaterials,
    TEXS: parseTextures,
    GEOS: parseGeosets,
    GEOA: parseGeosetAnims,
    BONE: parseBones,
    HELP: parseHelpers,
    ATCH: parseAttachments,
    PIVT: parsePivotPoints,
    EVTS: parseEventObjects,
    CLID: parseCollisionShapes,
    GLBS: parseGlobalSequences,
    PREM: parseParticleEmitters,
    PRE2: parseParticleEmitters2,
    CAMS: parseCameras,
    LITE: parseLights,
    TXAN: parseTextureAnims,
    RIBB: parseRibbonEmitters,
    FAFX: parseFaceFX,
    BPOS: parseBindPose,
    CORN: parseParticleEmitterPopcorn,
};

export function parse(arrayBuffer) {
    const state = new State(arrayBuffer);
    if (state.keyword() !== 'MDLX') throw new Error('Not a mdx model');
    const model = {
        // default
        Version: 800,
        Info: {
            Name: '',
            MinimumExtent: null,
            MaximumExtent: null,
            BoundsRadius: 0,
            BlendTime: 150,
        },
        Sequences: [],
        GlobalSequences: [],
        Textures: [],
        Materials: [],
        TextureAnims: [],
        Geosets: [],
        GeosetAnims: [],
        Bones: [],
        Helpers: [],
        Attachments: [],
        EventObjects: [],
        ParticleEmitters: [],
        ParticleEmitters2: [],
        Cameras: [],
        Lights: [],
        RibbonEmitters: [],
        CollisionShapes: [],
        PivotPoints: [],
        Nodes: [],
    };
    while (state.pos < state.length) {
        const keyword = state.keyword();
        const size = state.int32();
        if (keyword in parsers) {
            parsers[keyword](model, state, size);
        } else {
            // throw new Error('Unknown group ' + keyword);
            state.pos += size;
        }
    }
    console.log(model.Nodes);

    for (let i = 0; i < model.Nodes.length; ++i) {
        if (model.Nodes[i] && model.PivotPoints[i]) {
            model.Nodes[i].PivotPoint = model.PivotPoints[i];
        }
    }
    model.Info.NumGeosets = model.Geosets.length;
    model.Info.NumGeosetAnims = model.GeosetAnims.length;
    model.Info.NumBones = model.Bones.length;
    model.Info.NumLights = model.Lights.length;
    model.Info.NumAttachments = model.Attachments.length;
    model.Info.NumEvents = model.EventObjects.length;
    model.Info.NumParticleEmitters = model.ParticleEmitters.length;
    model.Info.NumParticleEmitters2 = model.ParticleEmitters2.length;
    model.Info.NumRibbonEmitters = model.RibbonEmitters.length;
    return model;
}
