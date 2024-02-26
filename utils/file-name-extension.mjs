/**
 * @param {string} filename
 * @return {string|null}
 */
export default filename => {
    const r = /.+\.(.+)$/.exec(filename);
    return r ? r[1] : null;
};