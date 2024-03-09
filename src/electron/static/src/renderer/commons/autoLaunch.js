import { ipcRenderer } from 'electron';
import { isLinux } from '../constant/platform';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';

async function setAutoLaunch(on) {
  if (isLinux()) {
    const [version, exePath, homePath] = await Promise.all(
      [['getVersion'], ['getPath', 'exe'], ['getPath', 'home']].map((args) =>
        ipcRenderer.invoke('app', ...args)
      )
    );
    const linuxStartupDir = join(homePath, '.config', 'autostart');
    const linuxStartupFile = join(linuxStartupDir, `shadowfly.desktop`);
    const d = `[Desktop Entry]
    Type=Application
    Version=${version}
    Name=Shadowfly
    Comment=Shadowfly startup script
    Exec="${exePath}"
    StartupNotify=false
    Terminal=false`;
    if (on) {
      if (!existsSync(linuxStartupDir)) {
        mkdirSync(linuxStartupDir);
      }
      writeFileSync(linuxStartupFile, d);
    } else {
      if (existsSync(linuxStartupFile)) {
        unlinkSync(linuxStartupFile);
      }
    }
  } else {
    await ipcRenderer.invoke('app', 'setLoginItemSettings', {
      openAtLogin: on,
    });
  }
}

export function install(Vue) {
  Vue.prototype.$setAutoLaunch = setAutoLaunch;
}
