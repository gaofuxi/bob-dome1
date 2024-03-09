import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import http from 'http';
import yaml from 'yaml';
import store from '../store/index';
import { ipcRenderer } from 'electron';
import moment from 'moment';
import cache from './cache';
import storageKeys from '../constant/storageKeys';
import { isWin, isMac, isLinux } from '../constant/platform';

export const md5Encrypt = (str) => {
  return createHash('md5').update(str).digest('hex');
};

export const traffic = (num, toFixed = 2, withSpace = true) => {
  const s = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  while (Math.floor(num / 1024) && idx < s.length - 1) {
    num /= 1024;
    idx++;
  }
  return `${idx === 0 ? num : num.toFixed(toFixed)}${withSpace ? ' ' : ''}${
    s[idx]
  }`;
};

export const parsePriceHint = (
  { month_price, year_price, onetime_price },
  { currency_symbol }
) => {
  const symbol = currency_symbol;
  if (onetime_price) {
    return `${symbol}${onetime_price / 100}/一次性`;
  }
  const mp = month_price > 0 ? `${symbol}${month_price / 100}/月` : '';
  const yp = year_price > 0 ? `${symbol}${year_price / 100}/年` : '';
  if (mp && yp) {
    return `${mp}（${yp}）`;
  }
  return mp || yp;
};

export const showDialog = async (options) => {
  return await ipcRenderer.invoke('dialog', 'showMessageBox', {
    title: 'index',
    ...options,
  });
};

export const deleteFolderRecursive = function (p) {
  if (fs.existsSync(p)) {
    fs.readdirSync(p).forEach((file, index) => {
      const curPath = path.join(p, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(p);
  }
};

export const setNowInterval = (fn, time) => {
  fn();
  return setInterval(fn, time);
};
