import store from '../store';
import { current, isMac, MAC_ARM64, MAC_X64 } from '../constant/platform';
import axios from 'axios';
import path,{ join as joinPath, resolve, } from 'path';

import { ipcRenderer, shell } from 'electron';

export const sysproxy = async (args = []) => {
  if (!isMac()) {
    return false;
  }

  const cwd = store.getters.binaryFilesPath;
 
  try {
    const { status, data } = await axios.post(
      'http://127.0.0.1:33220/command',
      {
        path: joinPath(cwd, 'sysproxy'),
        args,
      }
    );
    return { success: status === 200, output: data };
  } catch (e) {}
  return {
    success: false,
    data: '',
  };
};
