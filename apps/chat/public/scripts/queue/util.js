

export function makeId(length) {
  let result = '';
  const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function makePromise() {
  let resolve, reject;
  const p = new Promise((a, r) => {
  resolve = a;
  reject = r;
  });
  p.resolve = resolve;
  p.reject = reject;
  return p;
}