import { execSync } from 'child_process';
import { networkInterfaces } from 'os';
import { isIP, isIPv4 } from 'net';
import { isMac, isWin } from '../constant/platform';

const getDefaultInterface = function () {
  if (isMac()) {
    const out = execSync('netstat -nr | grep default ');
    const routers = out
      .toString()
      .split('\n')
      .map((str) => str.split(/\s+/).filter((i) => i))
      .filter((arr) => arr.length === 4 && isIPv4(arr[1]));
    const ifs = networkInterfaces();
    if (routers.length > 0) {
      for (const router of routers) {
        const name = router[3];
        if (Object.keys(ifs).includes(name)) {
          return name;
        }
      }
    }
    if (Object.keys(ifs).includes('en0')) {
      return 'en0';
    }
  } else if (isWin()) {
    const out = execSync('route print 0.0.0.0 mask 0.0.0.0', {
      windowsHide: true,
    });
    const routers = out
      .toString()
      .split('\n')
      .map((str) => str.split(/\s+/).filter((i) => i))
      .filter(
        (arr) =>
          arr.length === 5 &&
          arr.slice(0, 4).every((p) => isIP(p)) &&
          parseInt(arr[4]) !== NaN
      );
    const r = routers;
    const ifs = networkInterfaces();
    if (r.length > 0) {
      const orderByMetric = r.sort((a, b) => parseInt(a[4]) - parseInt(b[4]));
      for (const router of orderByMetric) {
        const ip = router[3];
        for (const k of Object.keys(ifs)) {
          const arr = ifs[k];
          const target = arr.find((a) => a.address === ip);
          if (target) {
            return k;
          }
        }
      }
    }
    if (Object.keys(ifs).includes('以太网')) {
      return '以太网';
    }
    if (Object.keys(ifs).includes('WLAN')) {
      return 'WLAN';
    }
  }

  return null;
};

export const ipv4Interfaces = () => {
  const interfaces = [];
  const systemInterfaces = networkInterfaces();
  Object.keys(systemInterfaces).forEach((k) => {
    const interfaceArr = systemInterfaces[k];
    if (k === 'Clash') {
      return;
    }
    interfaceArr.forEach((i) => {
      if (i.internal === true || i.family === 'IPv6') {
        return;
      }
      interfaces.push({ name: k, address: i.address });
    });
  });
  return interfaces;
};

export default getDefaultInterface;
