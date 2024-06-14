'use client'

import { useSuspense } from '@rest-hooks/react';
import { Endpoint } from '@rest-hooks/endpoint';
import { redirect } from 'next/navigation'
import { loadJWT } from '@/lib/loadJWT'
import { saveJWT } from '@/lib/saveJWT'
import { createClient } from '@/utils/supabase/client';


const authTokenParam = 'auth_token'
const aiHost = 'https://ai.upstreet.ai'
// const aiHost = 'http://localhost:7998'
const otpURL = `${aiHost}/api/otp`


const endpoint = new Endpoint(getJWT);


export default function LoginAuthToken() {
  useSuspense(endpoint);

  return null
}


async function getJWT() {
  const
    searchParams = new URL(location.href).searchParams,
    authToken = searchParams.get(authTokenParam)

  console.log( 'GET JWT!' )

  if ( authToken ){
    // Get JWT.
    const res = await fetch( `${otpURL}/${authToken}` )

    if (res.ok) {
      const jwt = await res.text();

      if (jwt) {
        localStorage.setItem('jwt', jwt);

        // // saveJWT(jwt);
        // const client = createClient();

        // const user = await client.auth.getUser(jwt)

        // console.log( 'USER:', user )

      } else {
        console.warn('Failed to get JWT.')
      }
    } else {
      console.warn('Failed to get JWT.')
    }

    if (location.pathname !== '/') redirect('/')
  }
}
