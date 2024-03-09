import {
  compatible,
  isMac,
  isWin,
  MAC_ARM64,
  WIN_IA32,
  WIN_X64,
} from '../constant/platform';
import store from '../store';
import { exec } from '@vscode/sudo-prompt';
import { join as joinPath } from 'path';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from 'fs';
import { deleteFolderRecursive, download, md5Encrypt } from './helper';
import { stringify } from 'yaml';
import * as axios from 'axios';
import Axios from 'axios';

const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
    <dict>
        <key>Label</key>
        <string>pro.shadowfly.helper</string>
        <key>Program</key>
        <string>helperPath</string>
        <key>RunAtLoad</key>
        <true/>
        <key>KeepAlive</key>
        <true/>
        <key>HardResourceLimits</key>
        <dict>
            <key>NumberOfFiles</key>
            <integer>10240</integer>
        </dict>
        <key>SoftResourceLimits</key>
        <dict>
            <key>NumberOfFiles</key>
            <integer>10240</integer>
        </dict>
    </dict>
</plist>`;

export const status = {
  Active: Symbol(),
  Inactive: Symbol(),
  NonExistent: Symbol(),
  Unknown: Symbol(),
};

const adminRun = (cmd) => {
  return new Promise((resolve, reject) => {
    exec(
      cmd,
      {
        name: 'CoreService',
      },
      (err, stdout, stderr) => {
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
      }
    );
  });
};

const workDirectory = () => {
  return joinPath(store.getters.binaryFilesPath, 'service');
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
    const clathPath = store.getters.clashPath;
    const serviceFolderPath = joinPath(clathPath, 'service');
    if (!existsSync(serviceFolderPath)) {
      mkdirSync(serviceFolderPath);
    }
    const helperPath = joinPath(clathPath, 'service', 'clash-core-service');
    copyFileSync(
      joinPath(workDirectory(), 'clash-core-service'),
      joinPath(helperPath)
    );
    const to = '/Library/LaunchDaemons/pro.shadowfly.helper.plist';
    await adminRun(
      `echo "${plist.replace(
        'helperPath',
        helperPath
      )}" > ${to} ; launchctl load -w ${to}`
    );
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const uninstallService = async () => {
  try {
    const to = '/Library/LaunchDaemons/pro.shadowfly.helper.plist';
    await adminRun(`launchctl unload ${to} ; rm ${to}`);
    const clathPath = store.getters.clashPath;
    const serviceFolderPath = joinPath(clathPath, 'service');
    if (existsSync(serviceFolderPath)) {
      deleteFolderRecursive(serviceFolderPath);
    }
    return true;
  } catch (e) {
    return false;
  }
};

export const needUpdate = () => {
  const clathPath = store.getters.clashPath;
  const serviceFolderPath = joinPath(clathPath, 'service');
  if (!existsSync(serviceFolderPath)) {
    return false;
  }
  const helperPath = joinPath(clathPath, 'service', 'clash-core-service');
  if (!existsSync(helperPath)) {
    return false;
  }
  const sourcePath = joinPath(workDirectory(), 'clash-core-service');
  const md5 = (path) => md5Encrypt(readFileSync(path));
  return md5(helperPath) !== md5(sourcePath);
};

export const updateService = async () => {
  try {
    const clathPath = store.getters.clashPath;
    const serviceFolderPath = joinPath(clathPath, 'service');
    if (!existsSync(serviceFolderPath)) {
      mkdirSync(serviceFolderPath);
    }
    const helperPath = joinPath(clathPath, 'service', 'clash-core-service');
    copyFileSync(
      joinPath(workDirectory(), 'clash-core-service'),
      joinPath(helperPath)
    );
    const to = '/Library/LaunchDaemons/pro.shadowfly.helper.plist';
    await adminRun(
      `launchctl unload ${to} ; echo "${plist.replace(
        'helperPath',
        helperPath
      )}" > ${to} ; launchctl load -w ${to}`
    );
    return true;
  } catch (e) {
    return false;
  }
};
