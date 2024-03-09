const cache = {
  put(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  },
  get(key) {
    const str = window.localStorage.getItem(key);
    if (str === '') {
      return undefined;
    }
    try {
      const obj = JSON.parse(str);
      return obj;
    } catch (e) {
      console.error(`get [${key}] from cache failed with error:`, e);
    }
    return undefined;
  },
};

export const cachey = (initValue, timeout = 3600) => {
  let v = initValue;
  setTimeout(() => {
    v = null;
  }, timeout * 1000);
  return () => {
    return v;
  };
};

export default cache;
