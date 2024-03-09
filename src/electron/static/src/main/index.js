import { effect, reactive } from '@vue/reactivity';
import axios from 'axios';
import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  MenuItem,
  ipcMain,
  Notification,
  shell,
  dialog,
  nativeImage,
  powerMonitor,
  screen,
  globalShortcut,
  nativeTheme,
  session, clipboard
} from 'electron';
import { exec } from 'child_process';
import cache from '../renderer/commons/cache';
import storageKeys from '../renderer/constant/storageKeys';
import store from '../renderer/store';

const { TouchBar } = require('electron');
const { TouchBarButton } = TouchBar;
const ex = process.execPath;
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const fixPath = require('fix-path');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path')
    .join(__dirname, '/static')
    .replace(/\\/g, '\\\\');

  fixPath();
}

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
if (process.platform === 'darwin') {
  app.dock.hide();
}
app.on('ready', function() {
  globalShortcut.register('Alt+F4', () => {
    let focusWin = BrowserWindow.getFocusedWindow();
    focusWin && focusWin.hide();
  });
});

let mainWindow;
let winCustomTrayWindow;
let winCustomTrayLastWidth;
let mainTray;
let downloadPath;

let clashCoreClient;

const winURL =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function isLinux() {
  return process.platform === 'linux';
}

function createWindow() {
  /**
   * Initial window options
   */

  mainWindow = new BrowserWindow({
    height: 520,
    width: 800,
    resizable: false,
    backgroundColor: '#FFFFFF',
    useContentSize: true,
    transparent: true, //设置透明
    show: true,
    minimizable: true,
    maximizable: false,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 10, y: 12 },
    frame: false,
    icon: isLinux() ? path.join(__static, 'imgs', 'icon_512.png') : undefined,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: process.env.NODE_ENV !== 'development',
      nodeIntegrationInWorker: false,
      // enableRemoteModule:true,
      contextIsolation: false,
      preload: path.resolve(path.join(__dirname, 'preload.js')) // zoomfactor
    }
  });

  require('@electron/remote/main').initialize();
  require('@electron/remote/main').enable(mainWindow.webContents);


  if (process.env.NODE_ENV !== 'development') {
    mainWindow.setMenu(null);
  }

  // mainWindow.webContents.session.webRequest.onHeadersReceived(
  //   { urls: ['https://*/api/v1/*'] },
  //   (details, callback) => {
  //     if (details?.responseHeaders?.['set-cookie']?.length > 0) {
  //       for (const idx in details.responseHeaders['set-cookie']) {
  //         details.responseHeaders['set-cookie'][idx] +=
  //           '; SameSite=none; Secure';
  //       }
  //     }
  //     if (details?.responseHeaders?.['Set-Cookie']?.length > 0) {
  //       for (const idx in details.responseHeaders['Set-Cookie']) {
  //         details.responseHeaders['Set-Cookie'][idx] +=
  //           '; SameSite=none; Secure';
  //       }
  //     }
  //     callback({ cancel: false, responseHeaders: details.responseHeaders });
  //   }
  // );

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return {
      action: 'allow',
      overrideBrowserWindowOptions: {
        webPreferences: {
          session: session.fromPartition(`${new Date().getTime()}`)
        }
      }
    };
  });

  mainWindow.webContents.on('console-message', (e, level, message, line) => {
    try {
      mainWindow.webContents.send(
        'console-message',
        level,
        typeof message === 'object'
          ? JSON.stringify(message, null, 2)
          : message,
        line
      );
    } catch (e) {
    }
  });

  mainWindow.webContents.on('will-navigate', (e) => e.preventDefault());

  mainWindow.loadURL(winURL, {
    userAgent: `Shadowfly/${app.getVersion()}`
  });

  mainWindow.webContents.on('render-process-gone', async (e, { reason }) => {
    if (process.platform === 'darwin') return;
    if (reason === 'crashed') {
      const options = {
        type: 'error',
        title: 'index',
        message: 'Dashboard has crashed!',
        buttons: ['Reload', 'Exit']
      };
      const { response } = await dialog.showMessageBox(mainWindow, options);

      if (response === 0) {
        reloadWindow();
      } else {
        app.quit();
      }
    }
  });

  ipcMain.handle('start-download', (e, url, path) => {
    mainWindow.webContents.downloadURL(url);
    downloadPath = path;
  });
  mainWindow.webContents.session.on(
    'will-download',
    (event, item, webContents) => {
      // Set the save path, making Electron not to prompt a save dialog.
      if (downloadPath) {
        item.setSavePath(downloadPath);
        item.on('updated', (event, state) => {
          if (state === 'interrupted') {
            mainWindow.webContents.send('download', 'interrupted');
          } else if (state === 'progressing') {
            if (item.isPaused()) {
              mainWindow.webContents.send('download', 'paused');
            } else {
              mainWindow.webContents.send(
                'download',
                'downloading',
                item.getReceivedBytes() / item.getTotalBytes()
              );
            }
          }
        });
        item.once('done', (event, state) => {
          if (state === 'completed') {
            mainWindow.webContents.send('download', 'completed');
          } else {
            mainWindow.webContents.send('download', 'failed', state);
          }
        });
        downloadPath = null;
      }
    }
  );

  ipcMain.handle('app', (e, method, ...args) => {
    switch (method) {
      case 'isPackaged':
        return app.isPackaged;
      case 'getPath':
        return app.getPath(...args);
      case 'getAppPath':
        return app.getAppPath();
      case 'getName':
        return app.getName();
      case 'getVersion':
        return app.getVersion();
      case 'setLoginItemSettings':
        return app.setLoginItemSettings(...args);
      case 'relaunch':
        return app.relaunch();
      case 'exit':
        return app.exit(...args);
      case 'quit':
        return app.quit();
      case 'getLocale':
        return app.getLocale();
    }
  });

  ipcMain.handle('window', (e, method, ...args) => {
    switch (method) {
      case 'close':
        return mainWindow.close();
      case 'minimize':
        return mainWindow.minimize();
      case 'maximize':
        return mainWindow.maximize();
      case 'unmaximize':
        return mainWindow.unmaximize();
      case 'setAlwaysOnTop':
        return mainWindow.setAlwaysOnTop(...args);
      case 'setTitleBarOverlay':
        return mainWindow.setTitleBarOverlay(...args);
      case 'reload':
        return mainWindow.reload();
    }
  });
  mainWindow.on('hide', () => {
    mainWindow.webContents.send('window-event', 'hide');
  });
  mainWindow.on('show', () => {
    if (process.platform === 'darwin') {
      app.dock.show();
    }
    mainWindow.webContents.send('window-event', 'show');
  });
  mainWindow.on('focus', () => {
    mainWindow.webContents.send('window-event', 'focus');
  });
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.webContents.send('window-event', 'close');
      if (mainTray) {
        mainWindow.blur();
        mainWindow.hide();
        if (process.platform === 'darwin') {
          app.dock.hide();
        }
      } else {
        mainWindow.minimize();
      }
    } else {
      globalShortcut.unregisterAll();
      app.exit();
    }
    return false;
  });
  mainWindow.on('maximize', (e) => {
    mainWindow.webContents.send('window-event', 'maximize');
  });
  mainWindow.on('unmaximize', (e) => {
    mainWindow.webContents.send('window-event', 'unmaximize');
  });
  mainWindow.on('session-end', function(event) {
    event.preventDefault();
    mainWindow.webContents.send('app-exit');
  });

  ipcMain.handle('webContent', (e, method, ...args) => {
    switch (method) {
      case 'toggleDevTools':
        return mainWindow.webContents.toggleDevTools();
    }
  });

  ipcMain.handle('dialog', async (e, method, ...args) => {
    switch (method) {
      case 'showMessageBox':
        return await dialog.showMessageBox(mainWindow, ...args);
      case 'showOpenDialogSync':
        return dialog.showOpenDialogSync(mainWindow, ...args);
    }
  });

  ipcMain.handle('globalShortcut', (e, method, ...args) => {
    switch (method) {
      case 'register':
        return globalShortcut.register(args[0], () => {
          mainWindow.webContents.send('shortcut-pressed', args[0]);
        });
      case 'unregister':
        return globalShortcut.unregister(...args);
      case 'isRegistered':
        return globalShortcut.isRegistered(...args);
    }
  });

  ipcMain.handle('nativeTheme', (e, method, ...args) => {
    switch (method) {
      case 'shouldUseDarkColors':
        return nativeTheme.shouldUseDarkColors;
    }
  });
  nativeTheme.on('updated', () => {
    mainWindow.webContents.send(
      'native-theme-updated',
      nativeTheme.shouldUseDarkColors
    );
  });

  ipcMain.handle('powerSaveBlocker', (e, method, ...args) => {
    switch (method) {
      case 'start':
        return powerSaveBlocker.start(...args);
      case 'stop':
        return powerSaveBlocker.stop(...args);
    }
  });

  powerMonitor.on('suspend', () => {
    mainWindow.webContents.send('power-event', 'suspend');
  });

  powerMonitor.on('resume', () => {
    mainWindow.webContents.send('power-event', 'resume');
  });

  ipcMain.handle('window-control', (e, type) => {
    switch (type) {
      case 'hide':
        app.quit();
        break;
      case 'show':
        mainWindow.show();
        break;
      case 'show-or-hide':
        if (!mainWindow.isVisible() || !mainWindow.isFocused()) {
          mainWindow.show();
        } else {
          app.quit();
        }
        break;
    }
  });

  ipcMain.on('cleanup-done', (e) => {
    app.isQuiting = true;
    app.quit();
  });

  ipcMain.on('status-changed', (_, path) => {
    try {
      if (process.platform !== 'darwin') {
        mainTray.setImage(path);
      }
    } catch (e) {
    }
  });

  ipcMain.on('show-notification', (_, data) => {
    const iconPath =
      process.env.NODE_ENV === 'development'
        ? 'static/imgs/logo_64.png'
        : path.join(global.__static, 'imgs/logo_64.png');
    let notify = new Notification({
      ...data,
      icon:
        process.platform !== 'darwin'
          ? nativeImage.createFromPath(iconPath)
          : null
    });

    const { folder, url } = data;
    if (folder) {
      notify.on('click', () => {
        shell.openPath(data.folder);
      });
    }
    if (url) {
      notify.on('click', () => {
        shell.openExternal(url);
      });
    }
    notify.show();
  });
  ipcMain.on('autoOpen', (e, i) => {
    console.log('autoOpen', i === true);
    if (i === true) {
      app.setLoginItemSettings({
        openAtLogin: true,
        path: ex,
        args: []
      });
      let list = {
        status: true
      };
      fs.writeFile(app.getPath('userData') + '/' + 'auto.txt', JSON.stringify(list), function(
        err) {
        if (err) {
        } else {

        }
      });
    } else {
      app.setLoginItemSettings({
        openAtLogin: false,
        path: ex,
        args: []
      });
      let list = {
        status: false
      };
      fs.writeFile(app.getPath('userData') + '/' + 'auto.txt', JSON.stringify(list), function(
        err) {
        if (err) {
        } else {

        }
      });
    }

  });

  ipcMain.on('clash-core-info', (e, { port, secret }) => {
    if (port > 0) {
      clashCoreClient = axios.create({
        baseURL: `http://127.0.0.1:${port}/`,
        timeout: 1000,
        headers: {
          Authorization: `Bearer ${secret}`
        }
      });
    }
  });
  ipcMain.on('min', function() {
    mainWindow.minimize();
  });
  ipcMain.on('closewin', function() {
    if (process.platform === 'darwin') {
      mainWindow.minimize();
    } else {
      mainWindow.hide();
    }

    //app.quit()
  });

  const menuInfo = {
    systemProxyChecked: false,
    tunModeChecked: false,
    mixinChecked: false,
    isReady: false,
    menuMode: '',
    menuStyle: 0
  };

  ipcMain.handle('connecting', (e, isConnecting) => {
    if (process.platform === 'darwin' && mainTray) {
      const img = nativeImage
        .createFromPath(
          path.join(__static, 'tray', `mac${isConnecting ? '' : '2'}.png`)
        )
        .resize({ width: 22, height: 22 });
      img.setTemplateImage(true);
      mainTray.setImage(img);
      contextMenu.items.forEach(function(item) {
        if (item.label === '启动代理'){
          item.checked = isConnecting;
        }
      })
    }
  });

  function copyExportCommand() {
    mainWindow.webContents.executeJavaScript('localStorage.getItem(\'' + storageKeys.USER_CONFIG + '\')', true).then((res) => {
      const result = JSON.parse(res);
      const httpPort = result.mixedPort;
      const socksPort = result.mixedPort;
      const url = 'http://127.0.0.1';
      clipboard.writeText(
        `export https_proxy=${url}:${httpPort};export http_proxy=${url}:${httpPort};export all_proxy=socks5://127.0.0.1:${socksPort}`
      );
    });

  }

  const contextMenu = new Menu();
  const subMenu = new Menu();

  const createTray = () => {
    if (mainTray) {
      return;
    }
    const macIcon = nativeImage
      .createFromPath(path.join(__static, 'tray', 'mac2.png'))
      .resize({ width: 22, height: 22 });
    macIcon.setTemplateImage(true);
    const winIconPath = path.join(__static, 'tray', 'win.ico');
    const iconPath = {
      ['win32']: winIconPath,
      ['darwin']: macIcon,
      ['linux']: winIconPath
    }[process.platform];
    mainTray = new Tray(iconPath);
    mainTray.setToolTip('index');

    const topLevelItem1 = new MenuItem({
      label: '显示主窗口',
      click: () => mainWindow.show()
    })
    contextMenu.append(topLevelItem1)
    contextMenu.append(new MenuItem({ type: 'separator' })) // 插入分隔线
    const topLevelItem2 = new MenuItem({
      label: '开启全局', type: 'checkbox', checked: false, click: function(item) {
        mainWindow.webContents.send('changeGlobalMode', item.checked);
      }
    })
    contextMenu.append(topLevelItem2)
    const topLevelItem3 = new MenuItem({
      label: '启动代理', type: 'checkbox', checked: false, click: function(item) {
        mainWindow.webContents.send('startConnect', item.checked);
      }
    })
    contextMenu.append(topLevelItem3)
    contextMenu.append(new MenuItem({ type: 'separator' })) // 插入分隔线
    const topLevelItem4 = new MenuItem({ label: "切换节点", tip: 'proxy', submenu: subMenu });
    contextMenu.append(topLevelItem4)
    if(process.platform === 'darwin'){
      contextMenu.append(new MenuItem({ type: 'separator' })) // 插入分隔线
      const topLevelItem5 = new MenuItem({
        label: '复制终端代理命令',
        click: copyExportCommand
      });
      contextMenu.append(topLevelItem5)
    }
    const topLevelItem6 = new MenuItem({
      label: '退出',
      click: () => {
        mainWindow.webContents.send('app-exit');
        setTimeout(() => {
          app.isQuiting = true;
          app.quit();
        }, 3000);
      }
    });
    contextMenu.append(new MenuItem({ type: 'separator' })) // 插入分隔线
    contextMenu.append(topLevelItem6);
    mainTray.setContextMenu(contextMenu);
    ipcMain.on('sync-clash-node', (event, args) => {
      args.forEach(function(value) {
        let flag_path = path.join(__static, "/flags/"+ value.flag+".png")
        const icon = nativeImage.createFromPath(flag_path).resize({ width: 16, height: 16 });
        const subMenuItem = new MenuItem({
          label: value.name, type: 'checkbox', flag: value.flag, checked: false, icon: icon, click: (value)=> {
            subMenu.items.forEach(function(item) {
              if (item.checked){
                item.checked = false;
              }
            })
            mainWindow.webContents.send('changeProxy', {name: value.label, flag: value.flag});
          }
        });
        subMenu.append(subMenuItem)
      })
    });

    ipcMain.on('sync-clash-proxy-name', (event, args) => {
      subMenu.items.forEach(function(item) {
        if (item.label === args){
          item.checked = true;
        } else {
          item.checked = false;
        }
      })
      topLevelItem4.label = args;
      mainTray.setContextMenu(contextMenu);
    })
    ipcMain.on('change-global-mode', (event, args) => {
      topLevelItem2.checked = args === 'global' ? true : false;
    })
  };

  const destroyTray = () => {
    if (mainTray) {
      mainTray.destroy();
      mainTray = null;
    }
  };

  createTray();

  ipcMain.handle('tray-create-destroy', (e, action = 'create') => {
    if (action === 'create') {
      createTray();
    }
    if (action === 'destroy') {
      destroyTray();
    }
  });

  ipcMain.on('sync-local-flow', (event, args) => {
      const downloadSpeed = args[1];
      const uploadSpeed = args[0];
      const title = `↑${uploadSpeed} ↓${downloadSpeed}`
      mainTray.setTitle(title);
  })

  ipcMain.on('clash-core-status-change', (_, status) => {
  });

  ipcMain.handle('tray-proxies-style', (e, style) => {
    menuInfo.menuStyle = style;
  });

  ipcMain.on('system-proxy-changed', (_, enable) => {
    menuInfo.systemProxyChecked = enable;
  });

  ipcMain.on('enhanced-tray-click', () => {
    mainWindow.show();
  });

  const applicationMenuTemplate = [
    // { role: "appMenu" },
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        {
          label: 'Close',
          accelerator: 'Command+W',
          click: () => {
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            mainWindow.webContents.send('app-exit');
          }
        }
      ]
    },
    {
      role: 'editMenu'
    },
    {
      label: 'View',
      submenu: [{ role: 'forceReload' }, { role: 'toggleDevTools' }]
    },
    { role: 'windowMenu' }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(applicationMenuTemplate));
}

function reloadWindow() {
  app.relaunch();
  app.exit(0);
}

let gotTheLock = app.requestSingleInstanceLock();

app.on('open-url', (e, url) => {
  mainWindow.webContents.send('app-open', [url]);
});

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, argv, cwd) => {
    if (mainWindow) {
      mainWindow.webContents.send('app-open', argv);
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
    }
  });
  app.on('ready', () => {
    require('electron-window-bounds').init();

    // macos shutdown handler
    powerMonitor.on('shutdown', (e) => {
      e.preventDefault();
      mainWindow.webContents.send('app-exit');
      setTimeout(() => {
        app.isQuiting = true;
        app.quit();
      }, 5000);
    });
    closeSystemProxy();
    createWindow();
  });
}

function closeSystemProxy() {
  switch (process.platform) {
    case 'win32':
      let resourceUrl = process.resourcesPath;
      resourceUrl = resourceUrl.replaceAll('\\', '/');
      const executable = path.resolve(path.join(resourceUrl, 'static', 'files', 'win', 'common', 'sysproxy.exe'));
      exec(`"${executable}" set 1`);
      // fs.writeFile(path.join(app.getPath('userData'), 'test.log'), `"${executable}" set 1`, (err) => {
      //   if (err) {
      //     console.log(err);
      //   }
      // })
      break;
    default:
      break;
  }
}

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

function displayCheck({ x, y }) {
  const displays = screen.getAllDisplays();
  const d = displays.find((dp) => {
    const { bounds } = dp;
    if (bounds) {
      const { x: dx, y: dy, width: dw, height: dh } = bounds;
      return _.inRange(x, dx, dx + dw) && _.inRange(y, dy, dy + dh);
    }
  });
  if (!d) {
    const { bounds } = screen.getDisplayNearestPoint({ x, y });
    if (bounds) {
      const { x, y } = bounds;
      return { x, y };
    }
  }
  return { x, y };
}
