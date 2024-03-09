export const WIN_X64 = Symbol();
export const WIN_IA32 = Symbol();
export const WIN_ARM = Symbol();
export const WIN_ARM64 = Symbol();
export const MAC_X64 = Symbol();
export const MAC_ARM64 = Symbol();
export const LINUX_X64 = Symbol();
export const LINUX_ARM64 = Symbol();
export const UNKNOWN = Symbol();

export const current = () => {
  if (process.platform === 'win32') {
    if (process.arch === 'x64') {
      return WIN_X64;
    }
    if (process.arch === 'ia32') {
      return WIN_IA32;
    }
    if (process.arch === 'arm') {
      return WIN_ARM;
    }
    if (process.arch === 'arm64') {
      return WIN_ARM64;
    }
  }
  if (process.platform === 'darwin') {
    if (process.arch === 'x64') {
      return MAC_X64;
    }
    if (process.arch === 'arm64') {
      return MAC_ARM64;
    }
  }
  if (process.platform === 'linux') {
    if (process.arch === 'x64') {
      return LINUX_X64;
    }
    if (process.arch === 'arm64') {
      return LINUX_ARM64;
    }
  }
  return UNKNOWN;
};

export const compatible = () => {
  const cur = current();
  if ([WIN_IA32, WIN_ARM].includes(cur)) {
    return WIN_IA32;
  }
  return cur;
};

export const isWin = () => {
  return [WIN_ARM, WIN_ARM64, WIN_IA32, WIN_X64].includes(current());
};

export const isMac = () => {
  return [MAC_X64, MAC_ARM64].includes(current());
};

export const isLinux = () => {
  return [LINUX_X64, LINUX_ARM64].includes(current());
};
