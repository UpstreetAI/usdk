'use client'

import { useEffect } from 'react'


const authTokenParam = 'auth_token'
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
  const
    searchParams = new URL(location.href).searchParams,
    authToken = searchParams.get(authTokenParam)

  console.log( 'GET JWT!' )

  if ( authToken ){
    // Get JWT.
    try {
      const res = await fetch( `${otpURL}/${authToken}` )

      if (res.ok) {
        const jwt = await res.text();

        if ( jwt ) {
          const cookies = document.cookie
          document.cookie = `auth-jwt=${jwt}`
        } else {
          throw new Error()
        }
      }
    } catch(e) {
      console.warn('Failed to get JWT.')
    }

    if (location.pathname !== '/') location.href = '/'
  }
}
