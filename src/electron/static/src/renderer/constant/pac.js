const defaultPAC = 'function FindProxyForURL(url, host) {\n  return "PROXY 127.0.0.1:%mixed-port%; SOCKS5 127.0.0.1:%mixed-port%; DIRECT;"\n}';

export default defaultPAC;