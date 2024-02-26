/**
 * @param  {number} num
 * @return {number}
 */
export default num => num > 0 && (num & num - 1) === 0 ? num : 1 << 32 - Math.clz32(num);
