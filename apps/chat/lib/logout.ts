// import { redirect } from 'next/navigation'

export function logout() {
  return new Promise<void>((resolve) => {
    // if (typeof document !== 'undefined') {
      document.cookie = 'auth-jwt=; Max-Age=0; path=/';
      // console.log('logged out', [document.cookie]);
      resolve();
    // }
  }).then(() => {
    location.replace('/');
  });
}