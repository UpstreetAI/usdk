const loginPathname = '/login';


export async function redirectToLoginTool() {
  /* Get the JWT. */

  // Redirect to the login tool.
  const
    loginURL = process.env.NEXT_PUBLIC_UPSTREET_LOGIN_URL,
    redirectURL = location.protocol + '//' + location.host + loginPathname;

  location.href = `${loginURL}?redirect_url=${redirectURL}`
}
