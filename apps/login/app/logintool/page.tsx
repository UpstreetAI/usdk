import React, {
  useState,
  useEffect,
  // useRef,
  // createContext,
} from 'react';
// import classnames from 'classnames';
// import {
//   jwtDecode,
// } from 'jwt-decode';

import { aiProxyAPI } from '@/const/api.js';

// import {
//   LoginProvider,
//   // LoginConsumer,
// } from './components/login-provider/LoginProvider.tsx';
import { MetamaskAuthUi } from '@/components/metamask-auth-ui/MetamaskAuthUi.jsx';
// import { AuthUi } from './components/auth-ui/AuthUi.jsx';
import { AuthUiLoginTool } from '@/components/auth-ui/AuthUILoginTool.jsx';
// import {
//   LoginRedirect,
// } from './components/login-redirect/LoginRedirect.jsx';

import { aiHost, authEndpoint } from '@/const/endpoints.js';
// import { EngineContext } from '../packages/engine/engine-context.js';

import styles from '../styles/Login.module.css';

//

// const cbPort = 10617;
// const cbUrl = `https://local.upstreet.ai:${cbPort}/`;

//

const LoginToolApp = ({
  cbUrl: localCbUrl,
  redirectUrl: localRedirectUrl,
}) => {
  const [cbUrl, setCbUrl] = useState(() => localCbUrl);
  const [redirectUrl, setRedirectUrl] = useState(() => localRedirectUrl);
  const [cbResult, setCbResult] = useState(null);
  const isRedirecting =
    new URL(window.location.href).searchParams.get('redirect') === 'true';

  //

  const [context, setContext] = useState(
    // () =>
    //   new EngineContext({
    //     anonymousLogin: false,
    //   }),
  );
  const hasCallbackOrRedirectUrl = !!(cbUrl || redirectUrl);
  const searchParams = new URL(location).searchParams;
  const actuallyHasCallbackOrRedirectUrl =
    searchParams.get('callback_url') || searchParams.get('redirect_url');

  const [done, setDone] = useState(!hasCallbackOrRedirectUrl && !isRedirecting);

  const [error, setError] = useState(
    hasCallbackOrRedirectUrl || isRedirecting
      ? ''
      : 'missing args. callback url: ' +
      cbUrl +
      ', redirect url: ' +
      redirectUrl +
      ', redirecting: ' +
      isRedirecting,
  );

  const { localStorageManager, supabaseClient } = context;

  //

  const oauthRedirectUrl = new URL(
    location.protocol + '//' + location.host + location.pathname,
  );
  oauthRedirectUrl.searchParams.set('redirect', 'true');
  cbUrl &&
    oauthRedirectUrl.searchParams.set('redirect_callback_url', btoa(cbUrl));
  redirectUrl &&
    oauthRedirectUrl.searchParams.set(
      'redirect_redirect_url',
      btoa(redirectUrl),
    );

  const callbackResult = async ({ id, jwt }) => {
    const res = await fetch(cbUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        jwt,
      }),
    });
    if (res.ok) {
      await res.blob();
    } else {
      throw new Error('invalid status code: ' + res.status);
    }
  };

  const createOTP = async (jwt) => {
    const res = await fetch(
      // `http://localhost:7998/${aiProxyAPI.registerOTP}?token=${jwt}`,
      `${aiHost}/${aiProxyAPI.registerOTP}?token=${jwt}`,
      {
        method: 'POST',
      },
    );

    if (res.ok) {
      return res.text();
    } else {
      throw new Error('Failed to create a one-time password.');
    }
  };

  const redirectResult = async ({ id, jwt }) => {
    const otp = await createOTP(jwt);

    const url = new URL(redirectUrl);
    url.searchParams.set('auth_token', otp);
    const urlString = url.toString();

    window.location.replace(urlString);
  };
  const finishResult = async (result) => {
    if (cbUrl) {
      setCbResult(result);
      await callbackResult(result);
    } else if (redirectUrl) {
      await redirectResult(result);
    } else {
      throw new Error('no finish method specified');
    }
  };

  const setProfile = async (profile) => {
    if (profile.loaded && profile.sessionUserId) {
      const { sessionUserId } = profile;
      const supabaseAccessToken = supabaseClient.getSupabaseAccessToken();
      const supabaseJwt = supabaseClient.getSupabaseJwt();
      const jwtString = supabaseAccessToken || supabaseJwt;
      console.log(
        'captured jwt 1',
        {
          profile,
          supabaseAccessToken,
          supabaseJwt,
          jwtString,
          sessionUserId,
        },
        new Error().stack,
      );
      // exchange the jwt for a long-lasting jwt
      const jwtString2 = await (async () => {
        const res = await fetch(`${authEndpoint}/user`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            supabaseJwt: jwtString,
          }),
        });
        if (res.ok) {
          const j = await res.json();
          // debugger;
          return j;
        } else {
          const text = await res.text();
          throw new Error('invalid status code: ' + res.status + ': ' + text);
        }
      })();
      console.log(
        'captured jwt 2',
        {
          jwtString,
          jwtString2,
        },
        new Error().stack,
      );
      try {
        await finishResult({
          id: sessionUserId,
          jwt: jwtString2,
        });
      } catch (err) {
        console.warn(err);
        setError(err.stack);
      }
      setDone(true);
    }
  };

  // force initial sign out so that the login works
  useEffect(() => {
    if (isRedirecting) {
      // clear the 'redirect' query string parameter
      const newUrl = new URL(
        location.protocol +
        '//' +
        location.host +
        location.pathname +
        location.search +
        location.hash,
      );
      const redirectCallbackURL = newUrl.searchParams.get(
        'redirect_callback_url',
      );
      if (redirectCallbackURL) {
        setCbUrl(atob(redirectCallbackURL));
      }

      const redirectRedirectURL = newUrl.searchParams.get(
        'redirect_redirect_url',
      );
      if (redirectRedirectURL) {
        setRedirectUrl(atob(redirectRedirectURL));
      }

      newUrl.searchParams.delete('redirect');
      history.replaceState(null, '', newUrl.href);
    } else {
      console.log('supabase clear');
      localStorageManager.deleteJwt();
      supabaseClient.supabase.auth.signOut();
      supabaseClient.reset();
    }
  }, []);

  // update post jwt when supabase sets it
  useEffect(() => {
    console.log('supabaseClient changed', supabaseClient);

    const profileupdate = (e) => {
      setProfile(e.data.profile);
    };
    supabaseClient.addEventListener('profileupdate', profileupdate);

    setProfile(supabaseClient.getProfile());

    return () => {
      supabaseClient.removeEventListener('profileupdate', profileupdate);
    };
  }, [supabaseClient, cbUrl, redirectUrl]);

  console.log('render login', {
    done,
    cbUrl,
    cbResult,
    error,
    actuallyHasCallbackOrRedirectUrl,
  });

  return (
    <>
      <div className={styles.loginApp}>
        <div className={styles.wrap}>
          {(() => {
            if (done) {
              if (cbUrl) {
                return (
                  <>
                    <div className={styles.done}>
                      {error ? (
                        <>
                          <CopyResultComponent cbResult={cbResult} />
                          <ErrorComponent error={error} />
                        </>
                      ) : (
                        <CloseWindow />
                      )}
                    </div>
                  </>
                );
              } else {
                return null;
              }
            } else {
              if (!actuallyHasCallbackOrRedirectUrl) {
                if (!done && cbResult) {
                  return <CopyResultComponent cbResult={cbResult} />;
                } else {
                  return null;
                }
              } else {
                return (
                  <AuthPicker
                    redirectTo={oauthRedirectUrl}
                    supabaseClient={supabaseClient}
                  />
                );
              }
            }
          })()}
        </div>
      </div>
    </>
  );
};

export default LoginToolApp;

function AuthPicker({ redirectTo, supabaseClient }) {
  return (
    <>
      <AuthUiLoginTool
        supabaseClient={supabaseClient}
        view="sign_in"
        redirectTo={redirectTo}
      />
      {typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask && (
        <MetamaskAuthUi
          localStorageManager={supabaseClient.localStorageManager}
          onClose={() => { }}
        // onClose={async (jwtString) => {
        //   try {
        //     await postJwt(jwtString);
        //   } catch(err) {
        //     console.warn(err);
        //     setError(err.message);
        //   }
        // }}
        />
      )}
      <div className="text-center pt-12 text-gray-400">
        {`© ${new Date().getFullYear()}. Upstreet, Inc. All rights reserved.`}
      </div>
    </>
  );
}

function CloseWindow() {
  return (
    <>
      <div className="flex relative">
        <img
          src="/assets/upstreet_logo_white.svg"
          className="w-auto h-24 inline-block m-auto mt-12"
          alt={'www.upstreet.ai'}
        />
      </div>
      <div className="text-center pt-12 text-gray-200 text-4xl mb-0">Done!</div>
      <div className="text-center pt-12 text-gray-200 text-2xl mb-8">
        You can close this window now.
      </div>
    </>
  );
}

function CopyResultComponent({ cbResult }) {
  const [copied, setCopied] = useState(false);
  const cbResultString = JSON.stringify(cbResult);
  const base64 = btoa(cbResultString);

  return (
    <>
      <div className="flex flex-col items-center pt-12 text-gray-200 text-4xl mb-0">
        <div className="text-gray-200 text-2xl font-bold mb-4">Login code</div>
        <div className="flex">
          <input
            type="text"
            value={base64}
            className="mb-4 text-white border-none h-8 mr-2 bg-gray-700 rounded text-sm px-4 py-2 cursor-pointer"
            readOnly
            onClick={(e) => e.target.select()}
          />
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(base64);
              setCopied(true);
              setTimeout(() => {
                setCopied(false);
              }, 1000);
            }}
            className="h-8 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </>
  );
}

function ErrorComponent({ error }) {
  return (
    <>
      <div className="flex relative">
        <img
          src="/assets/upstreet_logo_white.svg"
          className="w-auto h-24 inline-block m-auto mt-12"
          alt={'www.upstreet.ai'}
        />
      </div>
      <div className="text-center pt-12 text-gray-200 text-4xl mb-0">
        Error logging in. Try pasting the code manually.
      </div>
      {/* <div className="text-center pt-12 text-gray-200 text-2xl mb-8">
        {error}
      </div> */}
    </>
  );
}