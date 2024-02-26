import {findKeyframes, interpNum, interpVec3, interpQuat} from './interp.mjs';
const findLocalFrameRes = {
    frame: 0,
    from: 0,
    to: 0,
};
export class ModelInterp {
    static maxAnimVectorVal(vector) {
        if (typeof vector === 'number') {
            return vector;
        }
        let max = vector.Keys[0].Vector[0];
        for (let i = 1; i < vector.Keys.length; ++i) {
            if (vector.Keys[i].Vector[0] > max) {
                max = vector.Keys[i].Vector[0];
            }
        }
        return max;
    }
    rendererData;
    constructor(rendererData) {
        this.rendererData = rendererData;
    }
    num(animVector) {
        const res = this.findKeyframes(animVector);
        if (!res) {
            return null;
        }
        return interpNum(res.frame, res.left, res.right, animVector.LineType);
    }
    vec3(out, animVector) {
        const res = this.findKeyframes(animVector);
        if (!res) {
            return null;
        }
        return interpVec3(out, res.frame, res.left, res.right, animVector.LineType);
    }
    quat(out, animVector) {
        const res = this.findKeyframes(animVector);
        if (!res) {
            return null;
        }
        return interpQuat(out, res.frame, res.left, res.right, animVector.LineType);
    }
    animVectorVal(vector, defaultVal) {
        let res;
        if (typeof vector === 'number') {
            res = vector;
        } else {
            res = this.num(vector);
            if (res === null) {
                res = defaultVal;
            }
        }
        return res;
    }
    findKeyframes(animVector) {
        if (!animVector) {
            return null;
        }
        const {frame, from, to} = this.findLocalFrame(animVector);
        return findKeyframes(animVector, frame, from, to);
    }
    findLocalFrame(animVector) {
        if (typeof animVector.GlobalSeqId === 'number') {
            findLocalFrameRes.frame = this.rendererData.globalSequencesFrames[animVector.GlobalSeqId];
            findLocalFrameRes.from = 0;
            findLocalFrameRes.to = this.rendererData.model.GlobalSequences[animVector.GlobalSeqId];
        } else {
            findLocalFrameRes.frame = this.rendererData.frame;
            findLocalFrameRes.from = this.rendererData.animationInfo.Interval[0];
            findLocalFrameRes.to = this.rendererData.animationInfo.Interval[1];
        }
        return findLocalFrameRes;
    }
}
