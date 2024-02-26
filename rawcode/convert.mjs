/**
 * @param {number} number
 * @return {string}
 */
export const Dec2RawBE = number => {
    const n = BigInt(number);
    return String.fromCharCode(Number(n >> 24n & 255n), Number(n >> 16n & 255n), Number(n >> 8n & 255n), Number(n & 255n));
};

/**
 * @param {number} number
 * @return {string}
 */
export const Dec2RawLE = number => {
    const n = BigInt(number);
    return String.fromCharCode(Number(n & 255n), Number(n >> 8n & 255n), Number(n >> 16n & 255n), Number(n >> 24n & 255n));
};

/**
 * @param {string} string
 * @return {number}
 */
export const Raw2Dec = string => Number(BigInt(string.charCodeAt(3)) | BigInt(string.charCodeAt(2)) << 8n | BigInt(string.charCodeAt(1)) << 16n | BigInt(string.charCodeAt(0)) << 24n);

/**
 * @param {string} string
 * @return {string}
 */
export const Raw2HexLE = string => `${string.charCodeAt(3).toString(16)}${string.charCodeAt(2).toString(16)}${string.charCodeAt(1).toString(16)}${string.charCodeAt(0).toString(16)}`;

/**
 * @param {string} string
 * @return {string}
 */
export const Raw2HexBE = string => `${string.charCodeAt(0).toString(16)}${string.charCodeAt(1).toString(16)}${string.charCodeAt(2).toString(16)}${string.charCodeAt(3).toString(16)}`;

/**
 * @param string
 * @return {string}
 */
export const HexLE2Raw = string => `${String.fromCharCode(parseInt(`${string[7]}${string[6]}`, 16))}${String.fromCharCode(parseInt(`${string[5]}${string[4]}`, 16))}${String.fromCharCode(parseInt(`${string[3]}${string[2]}`, 16))}${String.fromCharCode(parseInt(`${string[1]}${string[0]}`, 16))}`;

/**
 * @param string
 * @return {string}
 */
export const HexBE2Raw = string => `${String.fromCharCode(parseInt(`${string[0]}${string[1]}`, 16))}${String.fromCharCode(parseInt(`${string[2]}${string[3]}`, 16))}${String.fromCharCode(parseInt(`${string[4]}${string[5]}`, 16))}${String.fromCharCode(parseInt(`${string[6]}${string[7]}`, 16))}`;

/**
 * @param {number} number
 * @return {string}
 */
export const Dec2HexBE = number => number.toString(16).padStart(8, '0');