import { exec, execSync, spawn } from 'child_process';
import {
  compatible,
  isMac,
  WIN_X64,
  WIN_IA32,
  WIN_ARM64,
  MAC_X64,
  MAC_ARM64,
  LINUX_ARM64,
  LINUX_X64,
} from '../constant/platform';
import store from '../store';
import path, { join } from 'path';
import {
  exists,
  fstat,
  stat,
  readdir,
  unlink,
  existsSync,
  mkdirSync,
  createWriteStream,
} from 'fs';
import { ipcRenderer } from 'electron';
import cache from './cache';
import storageKeys from '../constant/storageKeys';
import axios from 'axios';
import moment from 'moment';

let clashProcess = null;

export const killProcess = ({ pid }) => {
  try {
    execSync(isMac() ? `kill -9 ${pid}` : `taskkill /F /PID ${pid}`, {
      windowsHide: true,
    });
  } catch (e) {}
};

export const killClash = async () => {
  const isServiceMode = store.state.app.isServiceConnecting;
  clashProcess && killProcess(clashProcess);
  clashProcess = null;
  if (isServiceMode) {
    await axios
      .get('http://127.0.0.1:33220/stop', {
        timeout: 1000,
      })
      .catch((e) => {});
  }
};

export const spawnClash = async () => {
  const isServiceMode = store.state.app.isServiceConnecting;
  console.log(`spawnClash with mode: ${isServiceMode ? 'service' : 'binary'}`);
  // kill last pi of clash core for debug on mac
  const pid = cache.get(storageKeys.DEBUG_LAST_CLASH_PID);
  if (pid) {
    killProcess({ pid });
  }
  const { coreControllerPort: controllerPort, staticPath } = store.state.app;
  const filesPath = path.join(staticPath, 'files');
  // console.log(filesPath,'files')
  const cwd = store.getters.binaryFilesPath;
  const binaryName = {
    [WIN_IA32]: 'clash-win32.exe',
    [WIN_X64]: 'clash-win64.exe',
    [WIN_ARM64]: 'clash-win-arm64.exe',
    [MAC_X64]: './clash-darwin',
    [MAC_ARM64]: './clash-darwin',
    [LINUX_ARM64]: 'clash-linux',
    [LINUX_X64]: 'clash-linux',
  }[compatible()];
  const clashPath = store.getters.clashPath;

  const logsFolderPath = path.join(clashPath, 'logs');
  if (!existsSync(logsFolderPath)) {
    mkdirSync(logsFolderPath);
  }

  readdir(path.join(clashPath, 'logs'), (err, files) => {
    if (!err && files.length > 0) {
      files.forEach((name) => {
        if (/^(.*?)\.log$/.test(name)) {
          let time = moment(RegExp.$1, 'YYYY-MM-DD-HHmmss');
          if (time.isBefore(moment().subtract(7, 'days'))) {
            unlink(path.join(clashPath, 'logs', name), (err) => {});
          }
        }
      });
    }
  });
  if (isServiceMode) {
    const { data: logFilePath, status } = await axios.post(
      `http://127.0.0.1:33220/start`,
      {
        path: store.state.app.isDevMode
          ? join(process.cwd(), cwd, binaryName)
          : join(cwd, binaryName),
        cwd: clashPath,
        silent: false,
      },
      {
        validateStatus: (_) => true,
      }
    );
    if (status === 200) {
      store.commit('setLogFilePath', logFilePath);
    }
  } else {
    // should be using cwd in options
    // https://github.com/electron/electron/issues/33725
    const p = spawn(join(cwd, binaryName), ['-d', clashPath], {
      windowsHide: true,
    });

    p.stdout.on('data', async (output) => {
      if (/level=info msg="RESTful API listening at:/.test(output.toString())) {
        console.log('clash core startup success!');
        // this.setClashStatus({ status: await this.getClashStatus() });
      }
      if (/level=fatal/.test(output.toString())) {
        console.error(output.toString());
        console.error('clash core startup failed!!!');
      }
    });

    const logFilePath = path.join(
      logsFolderPath,
      `${moment().format('YYYY-MM-DD-HHmmss')}.log`
    );
    const logFileStream = createWriteStream(logFilePath, {
      flags: 'a',
    });
    p.stderr.pipe(logFileStream);
    p.stdout.pipe(logFileStream);
    store.commit('setLogFilePath', logFilePath);

    cache.put(storageKeys.DEBUG_LAST_CLASH_PID, p.pid);

    clashProcess = p;
  }
};
