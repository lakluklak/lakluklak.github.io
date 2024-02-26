import * as os from 'os';
import chip from 'child_process';

/**
 * @param {string} fa
 * @param {string} fb
 */
export default (fa, fb) => {
    if (os.platform() === 'darwin') {
        const cwd = process.cwd();
        chip.exec(
            `osascript -e 'activate application "Terminal"' -e 'tell app "Terminal"
    do script "vbindiff ${cwd}/${fa} ${cwd}/${fb}"
end tell'`,
        );
    }
}