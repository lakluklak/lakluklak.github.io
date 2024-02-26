export var AnimVectorType;
(function(AnimVectorType) {
    AnimVectorType[(AnimVectorType['INT1'] = 0)] = 'INT1';
    AnimVectorType[(AnimVectorType['FLOAT1'] = 1)] = 'FLOAT1';
    AnimVectorType[(AnimVectorType['FLOAT3'] = 2)] = 'FLOAT3';
    AnimVectorType[(AnimVectorType['FLOAT4'] = 3)] = 'FLOAT4';
})(AnimVectorType || (AnimVectorType = {}));

export var FilterMode;
(function (FilterMode) {
    FilterMode[(FilterMode['None'] = 0)] = 'None';
    FilterMode[(FilterMode['Transparent'] = 1)] = 'Transparent';
    FilterMode[(FilterMode['Blend'] = 2)] = 'Blend';
    FilterMode[(FilterMode['Additive'] = 3)] = 'Additive';
    FilterMode[(FilterMode['AddAlpha'] = 4)] = 'AddAlpha';
    FilterMode[(FilterMode['Modulate'] = 5)] = 'Modulate';
    FilterMode[(FilterMode['Modulate2x'] = 6)] = 'Modulate2x';
})(FilterMode || (FilterMode = {}));

export var LineType;
(function (LineType) {
    LineType[(LineType['DontInterp'] = 0)] = 'DontInterp';
    LineType[(LineType['Linear'] = 1)] = 'Linear';
    LineType[(LineType['Hermite'] = 2)] = 'Hermite';
    LineType[(LineType['Bezier'] = 3)] = 'Bezier';
})(LineType || (LineType = {}));

export var LayerShading;
(function (LayerShading) {
    LayerShading[(LayerShading['Unshaded'] = 1)] = 'Unshaded';
    LayerShading[(LayerShading['SphereEnvMap'] = 2)] = 'SphereEnvMap';
    LayerShading[(LayerShading['TwoSided'] = 16)] = 'TwoSided';
    LayerShading[(LayerShading['Unfogged'] = 32)] = 'Unfogged';
    LayerShading[(LayerShading['NoDepthTest'] = 64)] = 'NoDepthTest';
    LayerShading[(LayerShading['NoDepthSet'] = 128)] = 'NoDepthSet';
})(LayerShading || (LayerShading = {}));
export var MaterialRenderMode;
(function (MaterialRenderMode) {
    MaterialRenderMode[(MaterialRenderMode['ConstantColor'] = 1)] = 'ConstantColor';
    MaterialRenderMode[(MaterialRenderMode['SortPrimsFarZ'] = 16)] = 'SortPrimsFarZ';
    MaterialRenderMode[(MaterialRenderMode['FullResolution'] = 32)] = 'FullResolution';
})(MaterialRenderMode || (MaterialRenderMode = {}));
export var GeosetAnimFlags;
(function (GeosetAnimFlags) {
    GeosetAnimFlags[(GeosetAnimFlags['DropShadow'] = 1)] = 'DropShadow';
    GeosetAnimFlags[(GeosetAnimFlags['Color'] = 2)] = 'Color';
})(GeosetAnimFlags || (GeosetAnimFlags = {}));
export var NodeFlags;
(function (NodeFlags) {
    NodeFlags[(NodeFlags['DontInheritTranslation'] = 1)] = 'DontInheritTranslation';
    NodeFlags[(NodeFlags['DontInheritRotation'] = 2)] = 'DontInheritRotation';
    NodeFlags[(NodeFlags['DontInheritScaling'] = 4)] = 'DontInheritScaling';
    NodeFlags[(NodeFlags['Billboarded'] = 8)] = 'Billboarded';
    NodeFlags[(NodeFlags['BillboardedLockX'] = 16)] = 'BillboardedLockX';
    NodeFlags[(NodeFlags['BillboardedLockY'] = 32)] = 'BillboardedLockY';
    NodeFlags[(NodeFlags['BillboardedLockZ'] = 64)] = 'BillboardedLockZ';
    NodeFlags[(NodeFlags['CameraAnchored'] = 128)] = 'CameraAnchored';
})(NodeFlags || (NodeFlags = {}));
export var NodeType;
(function (NodeType) {
    NodeType[(NodeType['Helper'] = 0)] = 'Helper';
    NodeType[(NodeType['Bone'] = 256)] = 'Bone';
    NodeType[(NodeType['Light'] = 512)] = 'Light';
    NodeType[(NodeType['EventObject'] = 1024)] = 'EventObject';
    NodeType[(NodeType['Attachment'] = 2048)] = 'Attachment';
    NodeType[(NodeType['ParticleEmitter'] = 4096)] = 'ParticleEmitter';
    NodeType[(NodeType['CollisionShape'] = 8192)] = 'CollisionShape';
    NodeType[(NodeType['RibbonEmitter'] = 16384)] = 'RibbonEmitter';
})(NodeType || (NodeType = {}));
export var CollisionShapeType;
(function (CollisionShapeType) {
    CollisionShapeType[(CollisionShapeType['Box'] = 0)] = 'Box';
    CollisionShapeType[(CollisionShapeType['Sphere'] = 2)] = 'Sphere';
})(CollisionShapeType || (CollisionShapeType = {}));
export var ParticleEmitterFlags;
(function (ParticleEmitterFlags) {
    ParticleEmitterFlags[(ParticleEmitterFlags['EmitterUsesMDL'] = 32768)] = 'EmitterUsesMDL';
    ParticleEmitterFlags[(ParticleEmitterFlags['EmitterUsesTGA'] = 65536)] = 'EmitterUsesTGA';
})(ParticleEmitterFlags || (ParticleEmitterFlags = {}));
export var ParticleEmitter2Flags;
(function (ParticleEmitter2Flags) {
    ParticleEmitter2Flags[(ParticleEmitter2Flags['Unshaded'] = 32768)] = 'Unshaded';
    ParticleEmitter2Flags[(ParticleEmitter2Flags['SortPrimsFarZ'] = 65536)] = 'SortPrimsFarZ';
    ParticleEmitter2Flags[(ParticleEmitter2Flags['LineEmitter'] = 131072)] = 'LineEmitter';
    ParticleEmitter2Flags[(ParticleEmitter2Flags['Unfogged'] = 262144)] = 'Unfogged';
    ParticleEmitter2Flags[(ParticleEmitter2Flags['ModelSpace'] = 524288)] = 'ModelSpace';
    ParticleEmitter2Flags[(ParticleEmitter2Flags['XYQuad'] = 1048576)] = 'XYQuad';
})(ParticleEmitter2Flags || (ParticleEmitter2Flags = {}));
export var ParticleEmitter2FilterMode;
(function (ParticleEmitter2FilterMode) {
    ParticleEmitter2FilterMode[(ParticleEmitter2FilterMode['Blend'] = 0)] = 'Blend';
    ParticleEmitter2FilterMode[(ParticleEmitter2FilterMode['Additive'] = 1)] = 'Additive';
    ParticleEmitter2FilterMode[(ParticleEmitter2FilterMode['Modulate'] = 2)] = 'Modulate';
    ParticleEmitter2FilterMode[(ParticleEmitter2FilterMode['Modulate2x'] = 3)] = 'Modulate2x';
    ParticleEmitter2FilterMode[(ParticleEmitter2FilterMode['AlphaKey'] = 4)] = 'AlphaKey';
})(ParticleEmitter2FilterMode || (ParticleEmitter2FilterMode = {}));
// Not actually mapped to mdx flags (0: Head, 1: Tail, 2: Both)
export var ParticleEmitter2FramesFlags;
(function (ParticleEmitter2FramesFlags) {
    ParticleEmitter2FramesFlags[(ParticleEmitter2FramesFlags['Head'] = 1)] = 'Head';
    ParticleEmitter2FramesFlags[(ParticleEmitter2FramesFlags['Tail'] = 2)] = 'Tail';
})(ParticleEmitter2FramesFlags || (ParticleEmitter2FramesFlags = {}));
export var LightType;
(function (LightType) {
    LightType[(LightType['Omnidirectional'] = 0)] = 'Omnidirectional';
    LightType[(LightType['Directional'] = 1)] = 'Directional';
    LightType[(LightType['Ambient'] = 2)] = 'Ambient';
})(LightType || (LightType = {}));
/* Since Version: 900 */
export var ParticleEmitterPopcornFlags;
(function (ParticleEmitterPopcornFlags) {
    ParticleEmitterPopcornFlags[(ParticleEmitterPopcornFlags['Unshaded'] = 32768)] = 'Unshaded';
    ParticleEmitterPopcornFlags[(ParticleEmitterPopcornFlags['SortPrimsFarZ'] = 65536)] = 'SortPrimsFarZ';
    ParticleEmitterPopcornFlags[(ParticleEmitterPopcornFlags['Unfogged'] = 262144)] = 'Unfogged';
})(ParticleEmitterPopcornFlags || (ParticleEmitterPopcornFlags = {}));
