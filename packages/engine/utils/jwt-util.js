export const getCleanJwt = () => {
  if (typeof localStorage === 'undefined') {
    return '';
  }

  let jwt = localStorage.getItem('jwt');
  jwt = jwt.slice(1, jwt.length - 1);
  return jwt;
};
