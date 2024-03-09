import { isMac } from './platform';

const winDefaultBypasses = [
  'localhost',
  '127.*',
  '10.*',
  '172.16.*',
  '172.17.*',
  '172.18.*',
  '172.19.*',
  '172.20.*',
  '172.21.*',
  '172.22.*',
  '172.23.*',
  '172.24.*',
  '172.25.*',
  '172.26.*',
  '172.27.*',
  '172.28.*',
  '172.29.*',
  '172.30.*',
  '172.31.*',
  '192.168.*',
  '<local>',
];
const macDefaultBypasses = [
  '127.0.0.1',
  '192.168.0.0/16',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '100.64.0.0/10',
  '17.0.0.0/8',
  'localhost',
  '*.local',
  '169.254.0.0/16',
  '224.0.0.0/4',
  '240.0.0.0/4',
];
const defaultBypasses = isMac() ? macDefaultBypasses : winDefaultBypasses;

export default defaultBypasses;
