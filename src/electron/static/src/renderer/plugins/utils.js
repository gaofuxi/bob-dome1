
let CryptoJS = require('crypto-js'); // 引入AES源码js
import md5 from 'js-md5';

export default {
    encrypt(word, keyStr) { // 加密
        keyStr = keyStr ? keyStr : 'ABGHNJHGSHUYG12';
        // let key = CryptoJS.enc.Utf8.parse(keyStr);
        let srcs = CryptoJS.enc.Utf8.parse(word);
        let encrypted = CryptoJS.AES.encrypt(srcs, keyStr);

        return encrypted.toString();
    },
    decrypt(string, code) { // 解密
        code = CryptoJS.MD5(code).toString();
        var iv = CryptoJS.enc.Utf8.parse(code.substring(0,16));
        var key = CryptoJS.enc.Utf8.parse(code.substring(16));

        return CryptoJS.AES.decrypt(string,key,{iv:iv,padding:CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
    },

    secret(string, code, operation) {
        code = CryptoJS.MD5(code).toString();
        var iv = CryptoJS.enc.Utf8.parse(code.substring(0,16));
        var key = CryptoJS.enc.Utf8.parse(code.substring(16));
        if(operation){
            return CryptoJS.AES.decrypt(string,key,{iv:iv,padding:CryptoJS.pad.Pkcs7}).toString(CryptoJS.enc.Utf8);
        }
        return CryptoJS.AES.encrypt(string, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7}).toString();
    }

};