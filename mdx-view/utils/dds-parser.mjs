var DDS_MAGIC = 0x20534444;
var DDSD_MIPMAPCOUNT = 0x20000;
var DDPF_FOURCC = 0x4;
var FOURCC_DXT1 = fourCCToInt32('DXT1');
var FOURCC_DXT3 = fourCCToInt32('DXT3');
var FOURCC_DXT5 = fourCCToInt32('DXT5');
// var FOURCC_DX10 = fourCCToInt32('DX10')
// var FOURCC_FP32F = 116 // DXGI_FORMAT_R32G32B32A32_FLOAT
var FOURCC_ATI2 = fourCCToInt32('ATI2'); // BC5, RGTC, 3Dc
// const DDSCAPS2_CUBEMAP = 0x200;
// const D3D10_RESOURCE_DIMENSION_TEXTURE2D = 3;
// const DXGI_FORMAT_R32G32B32A32_FLOAT = 2;
// The header length in 32 bit ints
var headerLengthInt = 31;
// Offsets into the header array
var off_magic = 0;
var off_size = 1;
var off_flags = 2;
var off_height = 3;
var off_width = 4;
var off_mipmapCount = 7;
var off_pfFlags = 20;
var off_pfFourCC = 21;

function parseHeaders(arrayBuffer) {
    var header = new Int32Array(arrayBuffer, 0, headerLengthInt);
    if (header[off_magic] !== DDS_MAGIC) {
        throw new Error('Invalid magic number in DDS header');
    }
    if (!(header[off_pfFlags] & DDPF_FOURCC)) {
        throw new Error('Unsupported format, must contain a FourCC code');
    }
    var blockBytes;
    var format;
    var fourCC = header[off_pfFourCC];
    switch (fourCC) {
        case FOURCC_DXT1:
            blockBytes = 8;
            format = 'dxt1';
            break;
        case FOURCC_DXT3:
            blockBytes = 16;
            format = 'dxt3';
            break;
        case FOURCC_DXT5:
            blockBytes = 16;
            format = 'dxt5';
            break;
        /* case FOURCC_FP32F:
            format = 'rgba32f';
            break; */
        case FOURCC_ATI2:
            blockBytes = 16;
            format = 'ati2';
            break;
        /* case FOURCC_DX10:
            var dx10Header = new Uint32Array(arrayBuffer.slice(128, 128 + 20));
            format = dx10Header[0];
            var resourceDimension = dx10Header[1];
            var miscFlag = dx10Header[2];
            var arraySize = dx10Header[3];
            var miscFlags2 = dx10Header[4];
    
            if (resourceDimension === D3D10_RESOURCE_DIMENSION_TEXTURE2D && format === DXGI_FORMAT_R32G32B32A32_FLOAT) {
                format = 'rgba32f';
            } else {
                throw new Error('Unsupported DX10 texture format ' + format);
            }
            break; */
        default:
            throw new Error('Unsupported FourCC code: ' + int32ToFourCC(fourCC));
    }
    var flags = header[off_flags];
    var mipmapCount = 1;
    if (flags & DDSD_MIPMAPCOUNT) {
        mipmapCount = Math.max(1, header[off_mipmapCount]);
    }
    // let cubemap = false;
    // const caps2 = header[off_caps2];
    /* if (caps2 & DDSCAPS2_CUBEMAP) {
        cubemap = true;
    } */
    var width = header[off_width];
    var height = header[off_height];
    var dataOffset = header[off_size] + 4;
    var texWidth = width;
    var texHeight = height;
    var images = [];
    var dataLength;
    /* if (fourCC === FOURCC_DX10) {
        dataOffset += 20;
    } */
    /* if (cubemap) {
        for (let f = 0; f < 6; f++) {
            if (format !== 'rgba32f') {
                throw new Error('Only RGBA32f cubemaps are supported');
            }
            const bpp = 4 * 32 / 8;

            width = texWidth;
            height = texHeight;

            // cubemap should have all mipmap levels defined
            // Math.log2(width) + 1
            const requiredMipLevels = Math.log(width) / Math.log(2) + 1;

            for (let i = 0; i < requiredMipLevels; i++) {
                dataLength = width * height * bpp;
                images.push({
                    offset: dataOffset,
                    length: dataLength,
                    shape: [ width, height ]
                });
                // Reuse data from the previous level if we are beyond mipmapCount
                // This is hack for CMFT not publishing full mipmap chain https://github.com/dariomanesku/cmft/issues/10
                if (i < mipmapCount) {
                    dataOffset += dataLength;
                }
                width = Math.floor(width / 2);
                height = Math.floor(height / 2);
            }
        }
    } else { */
    for (var i = 0; i < mipmapCount; i++) {
        dataLength = (((Math.max(4, width) / 4) * Math.max(4, height)) / 4) * blockBytes;
        images.push({
            offset: dataOffset,
            length: dataLength,
            shape: {
                width: width,
                height: height,
            },
        });
        dataOffset += dataLength;
        width = Math.floor(width / 2);
        height = Math.floor(height / 2);
    }
    /* } */
    return {
        shape: {
            width: texWidth,
            height: texHeight,
        },
        images: images,
        format: format,
        flags: flags,
        // cubemap: false
    };
}

function fourCCToInt32(value) {
    return value.charCodeAt(0) + (value.charCodeAt(1) << 8) + (value.charCodeAt(2) << 16) + (value.charCodeAt(3) << 24);
}

function int32ToFourCC(value) {
    return String.fromCharCode(value & 0xff, value >> 8 & 0xff, value >> 16 & 0xff, value >> 24 & 0xff);
}

/**
 * Returns a number, which when multiplied with a number of fromBits bits, will convert it to a toBits bits number.
 *
 * For example, 7 * convertBitRange(3, 8) == 255.
 *
 * In other words, if we look at the bits, 111 is the same to 3 bits as 11111111 is to 8 bits.
 */
function convertBitRange(fromBits, toBits) {
    return ((1 << toBits) - 1) / ((1 << fromBits) - 1);
}

var dxt4to8 = convertBitRange(4, 8);
var dxt5to8 = convertBitRange(5, 8);
var dxt6to8 = convertBitRange(6, 8);
var dx1colors = new Uint8Array(16);
var dx3colors = new Uint8Array(12);
var dx5alphas = new Uint8Array(8);
var red = new Uint8Array(8);
var green = new Uint8Array(8);

function dx1Colors(out, color0, color1) {
    var r0 = (color0 >> 11 & 31) * dxt5to8;
    var g0 = (color0 >> 5 & 63) * dxt6to8;
    var b0 = (color0 & 31) * dxt5to8;
    var r1 = (color1 >> 11 & 31) * dxt5to8;
    var g1 = (color1 >> 5 & 63) * dxt6to8;
    var b1 = (color1 & 31) * dxt5to8;
    // Minimum and maximum colors.
    out[0] = r0;
    out[1] = g0;
    out[2] = b0;
    out[3] = 255;
    out[4] = r1;
    out[5] = g1;
    out[6] = b1;
    out[7] = 255;
    // Interpolated colors.
    if (color0 > color1) {
        out[8] = 5 * r0 + 3 * r1 >> 3;
        out[9] = 5 * g0 + 3 * g1 >> 3;
        out[10] = 5 * b0 + 3 * b1 >> 3;
        out[11] = 255;
        out[12] = 5 * r1 + 3 * r0 >> 3;
        out[13] = 5 * g1 + 3 * g0 >> 3;
        out[14] = 5 * b1 + 3 * b0 >> 3;
        out[15] = 255;
    } else {
        out[8] = r0 + r1 >> 1;
        out[9] = g0 + g1 >> 1;
        out[10] = b0 + b1 >> 1;
        out[11] = 255;
        out[12] = 0;
        out[13] = 0;
        out[14] = 0;
        out[15] = 0;
    }
}

function dx3Colors(out, color0, color1) {
    var r0 = (color0 >> 11 & 31) * dxt5to8;
    var g0 = (color0 >> 5 & 63) * dxt6to8;
    var b0 = (color0 & 31) * dxt5to8;
    var r1 = (color1 >> 11 & 31) * dxt5to8;
    var g1 = (color1 >> 5 & 63) * dxt6to8;
    var b1 = (color1 & 31) * dxt5to8;
    // Minimum and maximum colors.
    out[0] = r0;
    out[1] = g0;
    out[2] = b0;
    out[3] = r1;
    out[4] = g1;
    out[5] = b1;
    // Interpolated colors.
    out[6] = 5 * r0 + 3 * r1 >> 3;
    out[7] = 5 * g0 + 3 * g1 >> 3;
    out[8] = 5 * b0 + 3 * b1 >> 3;
    out[9] = 5 * r1 + 3 * r0 >> 3;
    out[10] = 5 * g1 + 3 * g0 >> 3;
    out[11] = 5 * b1 + 3 * b0 >> 3;
}

function dx5Alphas(out, alpha0, alpha1) {
    // Minimum and maximum alphas.
    out[0] = alpha0;
    out[1] = alpha1;
    // Interpolated alphas.
    if (alpha0 > alpha1) {
        out[2] = 54 * alpha0 + 9 * alpha1 >> 6;
        out[3] = 45 * alpha0 + 18 * alpha1 >> 6;
        out[4] = 36 * alpha0 + 27 * alpha1 >> 6;
        out[5] = 27 * alpha0 + 36 * alpha1 >> 6;
        out[6] = 18 * alpha0 + 45 * alpha1 >> 6;
        out[7] = 9 * alpha0 + 54 * alpha1 >> 6;
    } else {
        out[2] = 12 * alpha0 + 3 * alpha1 >> 4;
        out[3] = 9 * alpha0 + 6 * alpha1 >> 4;
        out[4] = 6 * alpha0 + 9 * alpha1 >> 4;
        out[5] = 3 * alpha0 + 12 * alpha1 >> 4;
        out[6] = 0;
        out[7] = 255;
    }
}

function rgColors(out, color0, color1) {
    // Minimum and maximum red colors.
    out[0] = color0;
    out[1] = color1;
    // Interpolated red colors.
    if (color0 > color1) {
        out[2] = (6 * color0 + 1 * color1) / 7;
        out[3] = (5 * color0 + 2 * color1) / 7;
        out[4] = (4 * color0 + 3 * color1) / 7;
        out[5] = (3 * color0 + 4 * color1) / 7;
        out[6] = (2 * color0 + 5 * color1) / 7;
        out[7] = (1 * color0 + 6 * color1) / 7;
    } else {
        out[2] = (4 * color0 + 1 * color1) / 5;
        out[3] = (3 * color0 + 2 * color1) / 5;
        out[4] = (2 * color0 + 3 * color1) / 5;
        out[5] = (1 * color0 + 4 * color1) / 5;
        out[6] = 0;
        out[7] = 1;
    }
}

/**
 * Decodes DXT1 data to a Uint8Array typed array with 8-8-8-8 RGBA bits.
 *
 * DXT1 is also known as BC1.
 */
function decodeDxt1(src, width, height) {
    var dst = new Uint8Array(width * height * 4);
    for (var blockY = 0, blockHeight = height / 4; blockY < blockHeight; blockY++) {
        for (var blockX = 0, blockWidth = width / 4; blockX < blockWidth; blockX++) {
            var i = 8 * (blockY * blockWidth + blockX);
            // Get the color values.
            dx1Colors(dx1colors, src[i] + 256 * src[i + 1], src[i + 2] + 256 * src[i + 3]);
            // The offset to the first pixel in the destination.
            var dstI = blockY * 16 * width + blockX * 16;
            // All 32 color bits.
            var bits = src[i + 4] | src[i + 5] << 8 | src[i + 6] << 16 | src[i + 7] << 24;
            for (var row = 0; row < 4; row++) {
                var rowOffset = row * 8;
                var dstOffset = dstI + row * width * 4;
                for (var column = 0; column < 4; column++) {
                    var dstIndex = dstOffset + column * 4;
                    var colorOffset = (bits >> rowOffset + column * 2 & 3) * 4;
                    dst[dstIndex + 0] = dx1colors[colorOffset + 0];
                    dst[dstIndex + 1] = dx1colors[colorOffset + 1];
                    dst[dstIndex + 2] = dx1colors[colorOffset + 2];
                    dst[dstIndex + 3] = dx1colors[colorOffset + 3];
                }
            }
        }
    }
    return dst;
}

/**
 * Decodes DXT3 data to a Uint8Array typed array with 8-8-8-8 RGBA bits.
 *
 * DXT3 is also known as BC2.
 */
function decodeDxt3(src, width, height) {
    var dst = new Uint8Array(width * height * 4);
    var rowBytes = width * 4;
    for (var blockY = 0, blockHeight = height / 4; blockY < blockHeight; blockY++) {
        for (var blockX = 0, blockWidth = width / 4; blockX < blockWidth; blockX++) {
            var i = 16 * (blockY * blockWidth + blockX);
            // Get the color values.
            dx3Colors(dx3colors, src[i + 8] + 256 * src[i + 9], src[i + 10] + 256 * src[i + 11]);
            var dstI = blockY * 16 * width + blockX * 16;
            for (var row = 0; row < 4; row++) {
                // Get 16 bits of alpha indices.
                var alphaBits = src[i + row * 2] + 256 * src[i + 1 + row * 2];
                // Get 8 bits of color indices.
                var colorBits = src[i + 12 + row];
                for (var column = 0; column < 4; column++) {
                    var dstIndex = dstI + column * 4;
                    var colorIndex = (colorBits >> column * 2 & 3) * 3;
                    dst[dstIndex + 0] = dx3colors[colorIndex + 0];
                    dst[dstIndex + 1] = dx3colors[colorIndex + 1];
                    dst[dstIndex + 2] = dx3colors[colorIndex + 2];
                    dst[dstIndex + 3] = (alphaBits >> column * 4 & 0xf) * dxt4to8;
                }
                dstI += rowBytes;
            }
        }
    }
    return dst;
}

/**
 * Decodes DXT5 data to a Uint8Array typed array with 8-8-8-8 RGBA bits.
 *
 * DXT5 is also known as BC3.
 */
function decodeDxt5(src, width, height) {
    var dst = new Uint8Array(width * height * 4);
    var rowBytes = width * 4;
    for (var blockY = 0, blockHeight = height / 4; blockY < blockHeight; blockY++) {
        for (var blockX = 0, blockWidth = width / 4; blockX < blockWidth; blockX++) {
            var i = 16 * (blockY * blockWidth + blockX);
            // Get the alpha values.
            dx5Alphas(dx5alphas, src[i], src[i + 1]);
            // Get the color values.
            dx3Colors(dx3colors, src[i + 8] + 256 * src[i + 9], src[i + 10] + 256 * src[i + 11]);
            // The offset to the first pixel in the destination.
            var dstI = blockY * 16 * width + blockX * 16;
            // The outer loop is only needed because JS bitwise operators only work on 32bit integers, while the alpha flags contain 48 bits.
            // Processing is instead done in two blocks, where each one handles 24 bits, or two rows of 4 pixels.
            for (var block = 0; block < 2; block++) {
                var alphaOffset = i + 2 + block * 3;
                var colorOffset = i + 12 + block * 2;
                // 24 alpha bits.
                var alphaBits = src[alphaOffset] + 256 * (src[alphaOffset + 1] + 256 * src[alphaOffset + 2]);
                // Go over two rows.
                for (var row = 0; row < 2; row++) {
                    var colorBits = src[colorOffset + row];
                    // Go over four columns.
                    for (var column = 0; column < 4; column++) {
                        var dstIndex = dstI + column * 4;
                        var colorIndex = (colorBits >> column * 2 & 3) * 3;
                        var alphaIndex = alphaBits >> row * 12 + column * 3 & 7;
                        // Set the pixel.
                        dst[dstIndex + 0] = dx3colors[colorIndex + 0];
                        dst[dstIndex + 1] = dx3colors[colorIndex + 1];
                        dst[dstIndex + 2] = dx3colors[colorIndex + 2];
                        dst[dstIndex + 3] = dx5alphas[alphaIndex];
                    }
                    // Next row.
                    dstI += rowBytes;
                }
            }
        }
    }
    return dst;
}

/**
 * Decodes RGTC data to a Uint8Array typed array with 8-8 RG bits.
 *
 * RGTC is also known as BC5, ATI2, and 3Dc.
 */
function decodeRgtc(src, width, height) {
    var dst = new Uint8Array(width * height * 4);
    var rowBytes = width * 2;
    for (var blockY = 0, blockHeight = height / 4; blockY < blockHeight; blockY++) {
        for (var blockX = 0, blockWidth = width / 4; blockX < blockWidth; blockX++) {
            var i = 16 * (blockY * blockWidth + blockX);
            // Get the red colors.
            rgColors(red, src[i], src[i + 1]);
            // Get the green colors.
            rgColors(green, src[i + 8], src[i + 9]);
            // The offset to the first pixel in the destination.
            var dstI = blockY * 8 * width + blockX * 8;
            // Split to two blocks of two rows, because there are 48 color bits.
            for (var block = 0; block < 2; block++) {
                var blockOffset = i + block * 3;
                // Get 24 bits of the color indices.
                var redbits = src[blockOffset + 2] + 256 * (src[blockOffset + 3] + 256 * src[blockOffset + 4]);
                var greenbits = src[blockOffset + 10] + 256 * (src[blockOffset + 11] + 256 * src[blockOffset + 12]);
                for (var row = 0; row < 2; row++) {
                    var rowOffset = row * 4;
                    for (var column = 0; column < 4; column++) {
                        var dstOffset = dstI + column * 2;
                        var shifts = 3 * (rowOffset + column);
                        dst[dstOffset * 2 + 0] = red[redbits >> shifts & 7];
                        dst[dstOffset * 2 + 1] = green[greenbits >> shifts & 7];
                    }
                    // Next row.
                    dstI += rowBytes;
                }
            }
        }
    }
    return dst;
}

function decodeDds(src, format, width, height) {
    if (format === 'dxt1') {
        return decodeDxt1(src, width, height);
    } else if (format === 'dxt3') {
        return decodeDxt3(src, width, height);
    } else if (format === 'dxt5') {
        return decodeDxt5(src, width, height);
    } else if (format === 'ati2') {
        return decodeRgtc(src, width, height);
    }
    throw new Error('Unsupported format');
}

export {decodeDds, decodeDxt1, decodeDxt3, decodeDxt5, decodeRgtc, parseHeaders};
