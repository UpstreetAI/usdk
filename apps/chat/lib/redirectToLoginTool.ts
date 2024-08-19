const loginPathname = '/login';

export async function redirectToLoginTool() {
  /* Get the JWT. */

  // Redirect to the login tool.
  const loginURL = process.env.NEXT_PUBLIC_UPSTREET_LOGIN_URL;
  const redirectURL = new URL(location.protocol + '//' + location.host + loginPathname);
  redirectURL.searchParams.set('referrer_url', encodeURI(location.href));
  const redirectURLString = redirectURL + '';

  location.href = `${loginURL}?redirect_url=${redirectURLString}`;
}
