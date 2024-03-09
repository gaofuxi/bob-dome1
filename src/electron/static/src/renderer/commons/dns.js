import net from 'net';
import { sysproxy } from './sysproxy';

export const setDNS = async (servers) => {
  const args = ['-dns', servers.length > 0 ? servers.join(',') : 'reset'];
  const { success } = await sysproxy(args);
  return success;
};

export const getDNS = async () => {
  const args = ['-dns', 'query'];
  const { success, output } = await sysproxy(args);
  if (success) {
    if (/.+?=(.+?);/.test(output)) {
      return RegExp.$1.split(',').filter((ip) => net.isIP(ip));
    }
  }
  return [];
};
