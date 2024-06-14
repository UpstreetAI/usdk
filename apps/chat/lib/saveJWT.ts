export function saveJWT(jwt: string) {
  return localStorage.setItem('jwt', jwt)
}
