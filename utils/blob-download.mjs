const a = document.createElement('a');

/**
 * @param {Blob} blob
 * @param {string} name
 */
export default (blob, name) => {
    a.href = URL.createObjectURL(blob);
    a.target = '_blank';
    a.download = name;
    a.click();
}