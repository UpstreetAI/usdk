import React, {
  useCallback,
  useEffect,
  useRef,
  // createContext,
} from 'react';
// import classnames from 'classnames';

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import MainMaskFrame from '../ui/ChatApp/components/MainMaskFrame/MainMaskFrame.tsx';

// import {
//   SupabaseClient,
// } from '../../../packages/engine/clients/supabase-client.js';

import styles from '../../../styles/AuthUi.module.css';

//

const AuthWrap = ({ supabaseClient, children }) => {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;

    if (el) {
      const onMouseDown = (e) => {
        let element = e.target;
        // Traverse up the DOM tree to find if any parent is a button
        while (element && element.nodeName !== 'BUTTON') {
          element = element.parentElement;
        }

        if (element && element.nodeName === 'BUTTON') {
          localStorage.removeItem('jwt');
        }
      };

      el.addEventListener('click', onMouseDown, true);

      return () => {
        el.removeEventListener('click', onMouseDown, true);
      };
    }
  }, [ref.current]);

  return (
    <div ref={ref}>
      <MainMaskFrame>
        <div className={styles.mainBg} />
      </MainMaskFrame>
      <div className={styles.authWrap}>
        <img
          src={'/ui/assets/backgrounds/AuthUi/symbols-1.svg'}
          alt=""
          className={styles.symbols1}
        />
        <img
          src={'/ui/assets/backgrounds/AuthUi/symbols-2.svg'}
          alt=""
          className={styles.symbols2}
        />
        {children}
      </div>
    </div>
  );
};

export const AuthUi = ({ supabaseClient, view = 'sign_up', redirectTo }) => {
  const { supabase } = supabaseClient;
  return (
    <AuthWrap supabaseClient={supabaseClient}>
      <div className="flex pb-4 text-2xl font-bold z-1 relative">
        <span className="text-[#2E80AA] text-center w-full">
          Connect with social media
        </span>
      </div>
      <Auth
        supabaseClient={supabase}
        theme="dark"
        appearance={{
          theme: ThemeSupa,
          // If you want to extend the default styles instead of overriding it, set this to true
          extend: true,
          // Your custom classes
          className: {
            button: styles.authButton,
            container: styles.authContainer,
            anchor: styles.authAnchor,
            divider: styles.authDivider,
            label: styles.authLabel,
            input: styles.authInput,
            loader: styles.authLoader,
            message: styles.authMessage,
          },
          variables: {
            default: {
              colors: {
                brand: '#3f51b5',
                brandAccent: '#6573c3',
              },
              // fonts: {
              //   bodyFontFamily: `M PLUS 1`,
              //   buttonFontFamily: `Muli`,
              //   inputFontFamily: `M PLUS 1`,
              //   labelFontFamily: `M PLUS 1`,
              // },
            },
          },
        }}
        providers={[
          'twitter',
          'discord',
          'google',
          // 'facebook',
          'github',
        ]}
        onlyThirdPartyProviders={true}
        localization={{
          variables: {
            sign_in: {
              // email_label: 'Email',
              email_label: '',
              email_input_placeholder: 'email',
              // password_label: 'Password',
              password_label: '',
              password_input_placeholder: 'password',

              social_provider_text: ' {{provider}}',
              // button_label: 'Sign in w/ email',
            },
            sign_up: {
              // email_label: 'Email',
              email_label: '',
              email_input_placeholder: 'email address',
              // password_label: 'Password',
              password_label: '',
              password_input_placeholder: 'Choose a password',

              social_provider_text: ' {{provider}}',
            },
            forgotten_password: {
              // email_label: 'Email',
              email_label: '',
              email_input_placeholder: 'your@email.com',

              button_label: 'Send instructions',
              loading_button_label: 'Sending instructions...',
            },
          },
        }}
        view={view}
        redirectTo={redirectTo}
      />
    </AuthWrap>
  );
};
