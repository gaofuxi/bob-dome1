import isEmail from 'validator/lib/isEmail';

export const checkEmail = (email) => {
  if (!email) {
    return 'Email empty error';
  }
  if (!isEmail(email)) {
    return 'Email format error';
  }
  return '';
};

export const checkPassword = (password) => {
  if (!password) {
    return 'Password empty error';
  }
  if (password.length < 8) {
    return 'Password length error';
  }
  return '';
};

export const checkCode = (code) => {
  if (!code) {
    return 'Code empty error';
  }
  if (code.length !== 6) {
    return 'Code length error';
  }
  return '';
};
