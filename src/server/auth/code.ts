const staticLoginCode =
  process.env.AUTH_LOGIN_CODE ||
  (process.env.NODE_ENV !== 'production' ? process.env.DEV_LOGIN_CODE || '123456' : '');

export function verifyOneTimeCode(code: string): boolean {
  if (!staticLoginCode) return false;
  return code === staticLoginCode;
}
