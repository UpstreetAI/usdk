'use client'

import { useEffect } from 'react'


const authTokenParam = 'auth_token'
const referrerUrlParam = 'referrer_url'
const aiHost = 'https://ai.upstreet.ai'
// const aiHost = 'http://localhost:7998'
const otpURL = `${aiHost}/api/otp`


export default function LoginAuthToken() {
  let isLoading = false

  useEffect( () => {
    if (!isLoading) {
      isLoading = true;
      getJWTFromOtp().catch(console.error);
    }
  }, [] )

  return null
}


async function getJWTFromOtp() {
  let href = location.href;

  // bugfix supabase munging the URL by simply appending ?auth_token=... to the end...
  {
    let match;
    if ((match = href.match(/(\?auth_token=([A-Za-z0-9+/=]+))$/))) {
      const end = match[1];
      const authToken = match[2];
      const start = href.slice(0, href.length - end.length);

      const tempUrl = new URL(start);
      tempUrl.searchParams.set('auth_token', authToken);
      href = tempUrl.toString();
    }
  }

  const u = new URL(href);
  const { searchParams } = u;
  const authToken = searchParams.get(authTokenParam);
  const referrerUrl = searchParams.get(referrerUrlParam);
  const nextUrl = referrerUrl || '/';

  console.log( 'GET JWT!', { authToken, referrerUrl } )

  if ( authToken ){
    // Get JWT.
    try {
      const res = await fetch( `${otpURL}/${authToken}` )

      if (res.ok) {
        const jwt = await res.text();

        if ( jwt ) {
          document.cookie = `auth-jwt=${jwt}`
        } else {
          throw new Error()
        }
      }
    } catch(e) {
      console.warn('Failed to get JWT.')
    }
  } else {
    console.warn('No auth token passed.')
  }

  location.href = nextUrl;
}
