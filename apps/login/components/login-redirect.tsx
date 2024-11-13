'use client';

import { getJWT } from '@/lib/jwt';
import { redirectToLoginTool } from '@/lib/redirectToLoginTool'
import { useEffect, useRef } from 'react';

export const LoginRedirect = () => {
  const isRedirected = useRef(false);
  useEffect(() => {
    if (!isRedirected.current) {
      isRedirected.current = true;

      (async () => {
        const jwt = await getJWT();
        if (!jwt) {
          redirectToLoginTool();
        }
      })();
    }
  }, []);
  return null;
};