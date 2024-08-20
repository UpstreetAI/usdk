import {
  loginEndpointUrl,
} from '@/utils/const/endpoints';

const loginPathname = '/login';

export async function redirectToLoginTool() {
  /* Get the JWT. */

  // Redirect to the login tool.
  const redirectURL = new URL(location.protocol + '//' + location.host + loginPathname);
  redirectURL.searchParams.set('referrer_url', encodeURI(location.href));
  const redirectURLString = redirectURL + '';

  const url = new URL(loginEndpointUrl);
  url.searchParams.set('redirect_url', redirectURLString);
  const urlString = url + '';

  location.href = urlString;
}
