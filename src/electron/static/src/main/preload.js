// workaround: https://github.com/electron/electron/issues/10572
process.once('loaded', () => {
  require('electron').webFrame.setZoomFactor(1);
});
