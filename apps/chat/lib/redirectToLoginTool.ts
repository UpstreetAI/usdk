import {
  loginEndpointUrl,
} from '@/utils/const/endpoints';

const loginPathname = '/login';

export function getLoginRedirectUrl(referrerUrl: string) {
  // redirect to the login page
  const redirectURL = new URL(location.href);
  redirectURL.pathname = loginPathname;
  redirectURL.searchParams.set('referrer_url', encodeURI(referrerUrl));
  const redirectURLString = redirectURL + '';

  const url = new URL(loginEndpointUrl);
  url.searchParams.set('redirect_url', redirectURLString);
  const urlString = url + '';
  return urlString;
}

export async function redirectToLoginTool() {
  location.href = getLoginRedirectUrl(location.href);
}
