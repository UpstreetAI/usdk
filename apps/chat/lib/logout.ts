// import { redirect } from 'next/navigation'

export function logout() {
  return new Promise<void>((resolve) => {
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-jwt=; Max-Age=0';
      resolve();
    }
  }).then(() => {
    location.replace('/');
  });
}