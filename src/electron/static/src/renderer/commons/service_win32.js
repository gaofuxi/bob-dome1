import {
  compatible,
  isWin,
  WIN_ARM64,
  WIN_IA32,
  WIN_X64,
} from '../constant/platform';
import store from '../store';
import axios from 'axios';
import { exec } from '@vscode/sudo-prompt';
import { join as joinPath } from 'path';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { deleteFolderRecursive, md5Encrypt } from './helper';
import { stringify } from 'yaml';

export const status = {
  Active: Symbol(),
  Inactive: Symbol(),
  NonExistent: Symbol(),
  Unknown: Symbol(),
};

const init = () => {
  const clathPath = store.getters.clashPath;
  const serviceFolderPath = joinPath(clathPath, 'service');
  if (!existsSync(serviceFolderPath)) {
    mkdirSync(serviceFolderPath);
  }
  const helperPath = joinPath(clathPath, 'service', 'clash-core-service.exe');
  copyFileSync(
    joinPath(workDirectory(), 'clash-core-service.exe'),
    joinPath(helperPath)
  );
  const servicePath = joinPath(clathPath, 'service', 'service.exe');
  copyFileSync(joinPath(workDirectory(), 'service.exe'), joinPath(servicePath));
  const configPath = joinPath(clathPath, 'service', 'service.yml');
  writeFileSync(
    configPath,
    stringify({
      id: 'Shadowfly Service',
      name: 'Shadowfly Service',
      description: 'Shadowfly TUN Service',
      executable: 'clash-core-service',
      log: {
        mode: 'none',
      },
    })
  );
};

const clean = () => {
  const clathPath = store.getters.clashPath;
  const serviceFolderPath = joinPath(clathPath, 'service');
  if (existsSync(serviceFolderPath)) {
    deleteFolderRecursive(serviceFolderPath);
  }
};

const adminRun = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      if (stderr) {
        reject(stderr);
      }
      if (stdout) {
        resolve(stdout.toString());
      }
      resolve('');
    });
  });
};

const workDirectory = () => {
  const filesPath = store.getters.filesPath;
  const servicePath = {
    [WIN_IA32]: 'win/ia32/service',
    [WIN_X64]: 'win/x64/service',
    [WIN_ARM64]: 'win/arm64/service',
  }[compatible()];
  return joinPath(filesPath, servicePath);
};

const execCommands = async (cmds = []) => {
  if (isWin()) {
    const clathPath = store.getters.clashPath;
    const cwd = joinPath(clathPath, 'service');
    const finalCommand = cmds
      .map(({ cmd, options = [] }) => {
        return `"${joinPath(cwd, 'service.exe')}" ${cmd} ${options.join(' ')}`;
      })
      .join(' & ');
    const output = await adminRun(finalCommand);
    return output;
  }
  return ``;
};

export const statusService = async () => {
  try {
    const { clashPath = '' } = store.getters;
    if (clashPath !== '' && !existsSync(joinPath(clashPath, 'service'))) {
      return status.Inactive;
    }
    const { status: statusCode } = await axios.get(
      'http://127.0.0.1:33220/ping',
      {
        timeout: 5000,
      }
    );
    return statusCode === 200 ? status.Active : status.Inactive;
  } catch (e) {}
  return status.Unknown;
};

export const installService = async () => {
  try {
    init();
    await execCommands([{ cmd: 'install' }, { cmd: 'start' }]);
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const uninstallService = async () => {
  try {
    await execCommands([{ cmd: 'stop' }, { cmd: 'uninstall' }]);
    clean();
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const needUpdate = () => {
  const clathPath = store.getters.clashPath;
  const serviceFolderPath = joinPath(clathPath, 'service');
  if (!existsSync(serviceFolderPath)) {
    return false;
  }
  const helperPath = joinPath(clathPath, 'service', 'clash-core-service.exe');
  if (!existsSync(helperPath)) {
    return false;
  }
  const sourcePath = joinPath(workDirectory(), 'clash-core-service.exe');
  const md5 = (path) => md5Encrypt(readFileSync(path));
  return md5(helperPath) !== md5(sourcePath);
};

export const updateService = async () => {
  try {
    if (await uninstallService()) {
      return await installService();
    }
  } catch (e) {
    return false;
  }
};
