import defaultBypasses from '../constant/bypass';
import { isMac, isWin } from '../constant/platform';
const child_process = require('child_process');
const path = require('path');
import { sysproxy } from './sysproxy';

const defatultHost = '127.0.0.1';

export function install(Vue, { store }) {
  Vue.prototype.$setSystemProxy = async function (on, port) {
    try {
      let success = false;
      if (isMac()) {
        let args;
        if (on) {
          args = [
            '-http',
            `${defatultHost}:${port}`,
            '-https',
            `${defatultHost}:${port}`,
            '-socks',
            `${defatultHost}:${port}`,
          ];
        } else {
          args = ['-stop'];
        }

        const { success: s1 } = await sysproxy(args);
        if (s1) {
          const { success: s2 } = await sysproxy([
            '-bypass',
            defaultBypasses.join(','),
          ]);
          if (s2) {
            success = true;
          }
        }
      } else if (isWin()) {
        const cwd = path.join(store.getters.filesPath, 'win', 'common');
        let args = ['set', '1'];
        if (on) {
          args = ['global', `${defatultHost}:${port}`];
          args.push(defaultBypasses.join(';'));
        }

        let out = child_process.spawnSync('sysproxy.exe', args, {
          cwd,
          windowsHide: true,
        });

        if (out.status === 0) {
          success = true;
        }
      }

      return success;
    } catch (e) {
      console.error(e.stack);
    }
    return false;
  };
}
