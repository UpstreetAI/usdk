// import { redirect } from 'next/navigation'

export function logout() {
  document.cookie = 'auth-jwt=; Max-Age=0';
  location.reload();
}
