/**
 * @param {number} num
 * @param {number} divider
 * @return {number}
 */
export default (num, divider) => num % divider === 0 ? num : Math.ceil(num / divider) * divider;
