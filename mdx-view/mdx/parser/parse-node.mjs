import {AnimVectorType} from '../../model.mjs';

const NONE = -1;
const MODEL_NODE_NAME_LENGTH = 0x50;

export default (model, node, state) => {
    const startPos = state.pos;
    const size = state.int32();
    node.Name = state.str(MODEL_NODE_NAME_LENGTH);
    node.ObjectId = state.int32();
    if (node.ObjectId === NONE) node.ObjectId = null;
    node.Parent = state.int32();
    if (node.Parent === NONE) node.Parent = null;
    node.Flags = state.int32();
    while (state.pos < startPos + size) {
        const keyword = state.keyword();
        if (keyword === 'KGTR') node.Translation = state.animVector(AnimVectorType.FLOAT3);
        else if (keyword === 'KGRT') node.Rotation = state.animVector(AnimVectorType.FLOAT4);
        else if (keyword === 'KGSC') node.Scaling = state.animVector(AnimVectorType.FLOAT3);
        else throw new Error(`Incorrect node chunk data ${keyword}`);
    }
    model.Nodes[node.ObjectId] = node;
};